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
  type AdminContext,
  type AdminRole,
} from '../_shared/adminSecurity.ts'

const StatusSchema = z.enum(['draft', 'active', 'archived'])
const AvailabilitySchema = z.enum(['in_store', 'made_to_measure', 'by_allocation'])
const stringArray = z.array(z.string().trim().min(1).max(120)).max(80)

const ProductFieldsSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  collection: z.string().trim().max(120).nullable().optional(),
  gender_segment: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  long_description: z.string().trim().max(4000).nullable().optional(),
  price: z.number().min(0).max(1_000_000).nullable().optional(),
  compare_at_price: z.number().min(0).max(1_000_000).nullable().optional(),
  sku: z.string().trim().max(64).regex(/^[A-Za-z0-9._\-/]*$/).nullable().optional(),
  stock_quantity: z.number().int().min(0).max(1_000_000).optional(),
  status: StatusSchema.optional(),
  featured: z.boolean().optional(),
  materials: z.string().trim().max(240).nullable().optional(),
  care_info: z.string().trim().max(240).nullable().optional(),
  seo_title: z.string().trim().max(80).nullable().optional(),
  seo_description: z.string().trim().max(180).nullable().optional(),
  thumbnail_url: z.string().trim().url().nullable().optional().or(z.literal('')),
  hero_image_url: z.string().trim().url().nullable().optional().or(z.literal('')),
  preorder_enabled: z.boolean().optional(),
  preorder_statement: z.string().trim().max(240).nullable().optional(),
  availability: AvailabilitySchema.optional(),
  size_options: stringArray.optional(),
  color_options: stringArray.optional(),
  media_gallery: z.array(z.string().trim().url()).max(80).optional(),
})

const CreateProductSchema = ProductFieldsSchema.extend({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})

const UpdateProductSchema = ProductFieldsSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'No changes supplied',
})

const ListQuerySchema = z.object({
  status: z.union([StatusSchema, z.literal('all')]).optional().default('all'),
  search: z.string().trim().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
})

const PRODUCT_SELECT = `
  *,
  product_options(*),
  product_images(*),
  product_variants(*, product_inventory(*))
`

const READ_ROLES: AdminRole[] = ['super_admin', 'admin', 'editor', 'support_viewer']
const WRITE_ROLES: AdminRole[] = ['super_admin', 'admin', 'editor']
const DELETE_ROLES: AdminRole[] = ['super_admin', 'admin']

function cleanPayload(payload: Record<string, unknown>) {
  const next: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(payload)) {
    if (value === '') next[key] = null
    else next[key] = value
  }

  return next
}

function normalizeArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => String(item).trim()).filter(Boolean)
}

async function upsertOption(supabase: any, productId: string, name: string, position: number, values: string[]) {
  if (values.length === 0) {
    await supabase.from('product_options').delete().eq('product_id', productId).eq('name', name)
    return
  }

  await supabase.from('product_options').upsert(
    { product_id: productId, name, position, option_values: values, sync_status: 'pending' },
    { onConflict: 'product_id,name' },
  )
}

async function syncDefaultVariantAndInventory(supabase: any, product: Record<string, any>) {
  const { data: existing } = await supabase
    .from('product_variants')
    .select('id')
    .eq('product_id', product.id)
    .eq('is_default', true)
    .is('deleted_at', null)
    .maybeSingle()

  const variantPayload = {
    product_id: product.id,
    title: 'Default',
    sku: product.sku ?? null,
    price: product.price ?? null,
    compare_at_price: product.compare_at_price ?? null,
    status: product.status ?? 'draft',
    is_default: true,
    position: 1,
    sync_status: 'pending',
  }

  const variantResult = existing?.id
    ? await supabase.from('product_variants').update(variantPayload).eq('id', existing.id).select('id').single()
    : await supabase.from('product_variants').insert(variantPayload).select('id').single()

  const variantId = variantResult.data?.id ?? existing?.id
  if (!variantId) return

  await supabase.from('product_inventory').upsert(
    {
      variant_id: variantId,
      quantity_available: Math.max(Number(product.stock_quantity ?? 0), 0),
      sync_status: 'pending',
    },
    { onConflict: 'variant_id' },
  )
}

async function upsertRoleImage(
  supabase: any,
  productId: string,
  role: 'thumbnail' | 'hero',
  url: string | null | undefined,
  altText: string,
) {
  if (!url) {
    await supabase.from('product_images').delete().eq('product_id', productId).eq('role', role).eq('position', 0)
    return
  }

  await supabase.from('product_images').upsert(
    { product_id: productId, role, position: 0, url, alt_text: altText, sync_status: 'pending' },
    { onConflict: 'product_id,role,position' },
  )
}

async function syncImages(supabase: any, product: Record<string, any>) {
  await upsertRoleImage(supabase, product.id, 'thumbnail', product.thumbnail_url, product.name)
  await upsertRoleImage(supabase, product.id, 'hero', product.hero_image_url, product.name)

  await supabase.from('product_images').delete().eq('product_id', product.id).eq('role', 'gallery')

  const gallery = normalizeArray(product.media_gallery)
  if (gallery.length > 0) {
    await supabase.from('product_images').insert(
      gallery.map((url, index) => ({
        product_id: product.id,
        role: 'gallery',
        position: index + 1,
        url,
        alt_text: product.name,
        sync_status: 'pending',
      })),
    )
  }
}

async function syncCatalogRows(supabase: any, product: Record<string, any>) {
  await upsertOption(supabase, product.id, 'Size', 1, normalizeArray(product.size_options))
  await upsertOption(
    supabase,
    product.id,
    'Color',
    normalizeArray(product.size_options).length > 0 ? 2 : 1,
    normalizeArray(product.color_options),
  )
  await syncDefaultVariantAndInventory(supabase, product)
  await syncImages(supabase, product)
}

async function fetchProduct(supabase: any, productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', productId)
    .maybeSingle()

  if (error) throw error
  return data
}

async function handleList(req: Request, supabase: any) {
  const url = new URL(req.url)
  const parsed = ListQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? undefined,
    search: url.searchParams.get('search') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
  })

  if (!parsed.success) return errorResponse(req, 'Invalid query', 400)

  if (url.searchParams.get('id')) {
    const product = await fetchProduct(supabase, url.searchParams.get('id')!)
    return jsonResponse(req, { product })
  }

  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(parsed.data.limit)

  if (parsed.data.status !== 'all') query = query.eq('status', parsed.data.status)
  if (parsed.data.search) query = query.ilike('name', `%${parsed.data.search}%`)

  const { data, error } = await query
  if (error) return errorResponse(req, 'Unable to load products', 500)

  return jsonResponse(req, { products: data ?? [] })
}

async function handleCreate(req: Request, supabase: any, context: AdminContext) {
  const rawBody = await parseJson(req)
  const parsed = CreateProductSchema.safeParse(rawBody)
  if (!parsed.success) return errorResponse(req, 'Invalid product payload', 400)

  const payload = cleanPayload({
    ...parsed.data,
    status: parsed.data.status ?? 'draft',
    stock_quantity: parsed.data.stock_quantity ?? 0,
    availability: parsed.data.availability ?? 'in_store',
    sync_status: 'pending',
  })

  const { data, error } = await supabase.from('products').insert(payload).select('*').single()
  if (error) return errorResponse(req, error.message, 400)

  await syncCatalogRows(supabase, data)
  const product = await fetchProduct(supabase, data.id)
  await auditLog(supabase, 'admin_product_created', context, { target_type: 'product', target_id: data.id })

  return jsonResponse(req, { product }, 201)
}

async function handleUpdate(req: Request, supabase: any, context: AdminContext) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return errorResponse(req, 'Missing product id', 400)

  const rawBody = await parseJson(req)
  const parsed = UpdateProductSchema.safeParse(rawBody)
  if (!parsed.success) return errorResponse(req, 'Invalid product payload', 400)

  const payload = cleanPayload({ ...parsed.data, sync_status: 'pending' })
  const { data, error } = await supabase.from('products').update(payload).eq('id', id).select('*').single()
  if (error) return errorResponse(req, error.message, 400)

  await syncCatalogRows(supabase, data)
  const product = await fetchProduct(supabase, data.id)
  await auditLog(supabase, 'admin_product_updated', context, { target_type: 'product', target_id: data.id })

  return jsonResponse(req, { product })
}

async function handleDelete(req: Request, supabase: any, context: AdminContext) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return errorResponse(req, 'Missing product id', 400)

  const { data, error } = await supabase
    .from('products')
    .update({ deleted_at: new Date().toISOString(), status: 'archived', sync_status: 'pending' })
    .eq('id', id)
    .select('id, name')
    .single()

  if (error) return errorResponse(req, error.message, 400)

  await supabase.from('product_variants').update({ deleted_at: new Date().toISOString(), sync_status: 'pending' }).eq('product_id', id)
  await auditLog(supabase, 'admin_product_deleted', context, { target_type: 'product', target_id: id })

  return jsonResponse(req, { success: true, product: data })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  if (!isAllowedOrigin(req)) {
    return errorResponse(req, 'Forbidden', 403)
  }

  const supabase = createServiceClient()

  if (req.method === 'GET') {
    const session = await validateAdminSession(req, supabase, { allowedRoles: READ_ROLES })
    if (!session.ok) return session.response
    return handleList(req, supabase)
  }

  if (req.method === 'POST') {
    const session = await validateAdminSession(req, supabase, { requireCsrf: true, allowedRoles: WRITE_ROLES })
    if (!session.ok) return session.response
    return handleCreate(req, supabase, session.context)
  }

  if (req.method === 'PATCH') {
    const session = await validateAdminSession(req, supabase, { requireCsrf: true, allowedRoles: WRITE_ROLES })
    if (!session.ok) return session.response
    return handleUpdate(req, supabase, session.context)
  }

  if (req.method === 'DELETE') {
    const session = await validateAdminSession(req, supabase, { requireCsrf: true, allowedRoles: DELETE_ROLES })
    if (!session.ok) return session.response
    return handleDelete(req, supabase, session.context)
  }

  return errorResponse(req, 'Method not allowed', 405)
})
