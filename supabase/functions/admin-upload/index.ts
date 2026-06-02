import { z } from 'npm:zod@3.23.8'
import {
  auditLog,
  createServiceClient,
  errorResponse,
  isAllowedOrigin,
  jsonResponse,
  optionsResponse,
  parseJson,
  validateAdminSession,
  type AdminRole,
} from '../_shared/adminSecurity.ts'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_BUCKET = 'product-images'
const ALLOWED_FOLDERS = [
  'products/thumbnails',
  'products/heroes',
  'products/gallery',
] as const

const WRITE_ROLES: AdminRole[] = ['super_admin', 'admin', 'editor']

const UploadSchema = z.object({
  bucket: z.literal(ALLOWED_BUCKET).optional().default(ALLOWED_BUCKET),
  folder: z.enum(ALLOWED_FOLDERS),
  fileName: z.string().trim().max(180).optional(),
  mimeType: z.string().trim().max(80),
  dataBase64: z.string().min(1),
})

const DeleteSchema = z.object({
  bucket: z.literal(ALLOWED_BUCKET).optional().default(ALLOWED_BUCKET),
  path: z.string().trim().max(500).optional(),
  url: z.string().trim().url().max(1200).optional(),
}).refine((value) => Boolean(value.path || value.url), { message: 'Missing upload path' })

function sanitizeName(value: string | undefined) {
  const base = (value || 'image')
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)

  return base || 'image'
}

function decodeBase64(value: string) {
  const normalized = value.includes(',') ? value.split(',').pop()! : value
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function sniffImage(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' }
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { mime: 'image/webp', ext: 'webp' }
  }

  return null
}

function validateFolderPath(path: string) {
  return ALLOWED_FOLDERS.some((folder) => path === folder || path.startsWith(`${folder}/`))
}

function pathFromUrl(url: string, bucket: string) {
  const parsed = new URL(url)
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = parsed.pathname.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(parsed.pathname.slice(index + marker.length))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  if (!isAllowedOrigin(req)) {
    return errorResponse(req, 'Forbidden', 403)
  }

  const supabase = createServiceClient()

  if (req.method === 'POST') {
    const session = await validateAdminSession(req, supabase, { requireCsrf: true, allowedRoles: WRITE_ROLES })
    if (!session.ok) return session.response

    const parsed = UploadSchema.safeParse(await parseJson(req))
    if (!parsed.success) return errorResponse(req, 'Invalid upload payload', 400)

    let bytes: Uint8Array
    try {
      bytes = decodeBase64(parsed.data.dataBase64)
    } catch {
      return errorResponse(req, 'Invalid upload encoding', 400)
    }

    if (bytes.byteLength === 0 || bytes.byteLength > MAX_UPLOAD_BYTES) {
      return errorResponse(req, 'Image must be between 1 byte and 5 MB', 400)
    }

    const detected = sniffImage(bytes)
    if (!detected) {
      return errorResponse(req, 'Only JPEG, PNG, and WebP images are allowed', 400)
    }

    if (parsed.data.mimeType !== detected.mime) {
      return errorResponse(req, 'Declared MIME type does not match file contents', 400)
    }

    const objectPath = `${parsed.data.folder}/${Date.now()}-${sanitizeName(parsed.data.fileName)}-${crypto.randomUUID()}.${detected.ext}`

    const { error: uploadError } = await supabase.storage
      .from(parsed.data.bucket)
      .upload(objectPath, bytes.buffer, {
        cacheControl: '31536000',
        contentType: detected.mime,
        upsert: false,
      })

    if (uploadError) return errorResponse(req, 'Unable to store image', 500)

    const { data } = supabase.storage.from(parsed.data.bucket).getPublicUrl(objectPath)
    await auditLog(supabase, 'admin_upload_created', session.context, {
      target_type: 'storage_object',
      target_id: objectPath,
      bucket: parsed.data.bucket,
      path: objectPath,
      mime_type: detected.mime,
      size_bytes: bytes.byteLength,
    })

    return jsonResponse(req, { url: data.publicUrl, path: objectPath, bucket: parsed.data.bucket })
  }

  if (req.method === 'DELETE') {
    const session = await validateAdminSession(req, supabase, { requireCsrf: true, allowedRoles: WRITE_ROLES })
    if (!session.ok) return session.response

    const parsed = DeleteSchema.safeParse(await parseJson(req))
    if (!parsed.success) return errorResponse(req, 'Invalid delete payload', 400)

    const objectPath = parsed.data.path || (parsed.data.url ? pathFromUrl(parsed.data.url, parsed.data.bucket) : null)
    if (!objectPath || !validateFolderPath(objectPath)) {
      return errorResponse(req, 'Invalid upload path', 400)
    }

    const { error: removeError } = await supabase.storage.from(parsed.data.bucket).remove([objectPath])
    if (removeError) return errorResponse(req, 'Unable to remove image', 500)

    await auditLog(supabase, 'admin_upload_deleted', session.context, {
      target_type: 'storage_object',
      target_id: objectPath,
      bucket: parsed.data.bucket,
      path: objectPath,
    })

    return jsonResponse(req, { success: true })
  }

  return errorResponse(req, 'Method not allowed', 405)
})
