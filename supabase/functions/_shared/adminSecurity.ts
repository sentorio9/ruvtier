import { createClient } from 'npm:@supabase/supabase-js@2'

export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'support_viewer'

export type AdminContext = {
  sessionId: string
  credentialId: string
  role: AdminRole
  displayLabel: string
}

export const ADMIN_SESSION_COOKIE = '__Host-rt_admin_session'
export const ADMIN_CSRF_HEADER = 'x-ruvtier-csrf'

const DEFAULT_ALLOWED_ORIGINS = [
  'https://ruvtier.com',
  'https://www.ruvtier.com',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]

const SESSION_COOKIE_SAMESITE = Deno.env.get('ADMIN_COOKIE_SAMESITE') || 'None'
const SESSION_COOKIE_PATH = '/'

export function createServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase service configuration')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function configuredAllowedOrigins() {
  const configured = (Deno.env.get('ADMIN_ALLOWED_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const siteUrls = [
    Deno.env.get('SITE_URL'),
    Deno.env.get('PUBLIC_SITE_URL'),
    Deno.env.get('APP_URL'),
  ].filter((origin): origin is string => Boolean(origin))

  return Array.from(new Set([...configured, ...siteUrls, ...DEFAULT_ALLOWED_ORIGINS]))
}

export function isAllowedOrigin(req: Request) {
  const origin = req.headers.get('origin')
  if (!origin) return true
  return configuredAllowedOrigins().includes(origin)
}

export function corsHeaders(req: Request) {
  const origin = req.headers.get('origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': `authorization, x-client-info, apikey, content-type, ${ADMIN_CSRF_HEADER}`,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin',
  }

  if (origin && configuredAllowedOrigins().includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

export function optionsResponse(req: Request) {
  if (!isAllowedOrigin(req)) {
    return new Response(null, { status: 403, headers: { 'Vary': 'Origin' } })
  }

  return new Response(null, { status: 204, headers: corsHeaders(req) })
}

export function jsonResponse(req: Request, data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(req),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export function errorResponse(req: Request, message: string, status = 400) {
  return jsonResponse(req, { error: message }, status)
}

export async function parseJson(req: Request) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

export function getClientIp(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export function getUserAgent(req: Request) {
  return req.headers.get('user-agent') || 'unknown'
}

export async function sha256Hex(input: string) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createSecretToken(bytes = 32) {
  const raw = new Uint8Array(bytes)
  crypto.getRandomValues(raw)
  return Array.from(raw).map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function parseCookies(req: Request) {
  const header = req.headers.get('cookie') || ''
  const cookies = new Map<string, string>()

  for (const part of header.split(';')) {
    const [name, ...valueParts] = part.trim().split('=')
    if (!name || valueParts.length === 0) continue
    cookies.set(name, decodeURIComponent(valueParts.join('=')))
  }

  return cookies
}

export function sessionCookie(sessionToken: string, maxAgeSeconds: number) {
  return [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(sessionToken)}`,
    'HttpOnly',
    'Secure',
    `SameSite=${SESSION_COOKIE_SAMESITE}`,
    `Path=${SESSION_COOKIE_PATH}`,
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ')
}

export function clearSessionCookie() {
  return [
    `${ADMIN_SESSION_COOKIE}=`,
    'HttpOnly',
    'Secure',
    `SameSite=${SESSION_COOKIE_SAMESITE}`,
    `Path=${SESSION_COOKIE_PATH}`,
    'Max-Age=0',
  ].join('; ')
}

export async function isRateLimited(
  supabase: any,
  scope: string,
  identifier: string,
  maxFailures = 5,
  windowMinutes = 15,
) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('rate_limit_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('scope', scope)
    .eq('identifier', identifier)
    .eq('success', false)
    .gte('attempted_at', since)

  return (count ?? 0) >= maxFailures
}

export async function recordRateLimitAttempt(
  supabase: any,
  scope: string,
  identifier: string,
  success: boolean,
  metadata: Record<string, unknown> = {},
) {
  await supabase.from('rate_limit_attempts').insert({ scope, identifier, success, metadata })

  if (Math.random() < 0.05) {
    supabase.rpc('cleanup_rate_limit_attempts', { _older_than_hours: 24 }).then(() => {}).catch(() => {})
  }
}

export async function auditLog(
  supabase: any,
  action: string,
  context: Partial<AdminContext> = {},
  details: Record<string, unknown> = {},
) {
  await supabase.from('audit_logs').insert({
    action,
    actor_email: context.displayLabel ?? null,
    actor_id: context.credentialId ?? null,
    target_type: details.target_type as string | undefined ?? null,
    target_id: details.target_id as string | undefined ?? null,
    details,
  })
}

function roleAllowed(role: string, allowedRoles?: AdminRole[]) {
  if (!allowedRoles || allowedRoles.length === 0) return true
  return allowedRoles.includes(role as AdminRole)
}

export async function validateAdminSession(
  req: Request,
  supabase: any,
  options: { requireCsrf?: boolean; allowedRoles?: AdminRole[] } = {},
): Promise<{ ok: true; context: AdminContext } | { ok: false; response: Response }> {
  if (!isAllowedOrigin(req)) {
    return { ok: false, response: errorResponse(req, 'Forbidden', 403) }
  }

  const token = parseCookies(req).get(ADMIN_SESSION_COOKIE)
  if (!token) {
    return { ok: false, response: errorResponse(req, 'Unauthorized', 401) }
  }

  const sessionTokenHash = await sha256Hex(token)
  const { data: session, error: sessionError } = await supabase
    .from('admin_sessions')
    .select('id, credential_id, expires_at, access_count, csrf_token_hash')
    .eq('session_token_hash', sessionTokenHash)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (sessionError || !session) {
    const response = errorResponse(req, 'Unauthorized', 401)
    response.headers.append('Set-Cookie', clearSessionCookie())
    return { ok: false, response }
  }

  if (options.requireCsrf) {
    const csrfToken = req.headers.get(ADMIN_CSRF_HEADER)
    if (!csrfToken || !session.csrf_token_hash || await sha256Hex(csrfToken) !== session.csrf_token_hash) {
      return { ok: false, response: errorResponse(req, 'Invalid CSRF token', 403) }
    }
  }

  const { data: credential } = await supabase
    .from('admin_credentials')
    .select('id, role, display_label, is_active')
    .eq('id', session.credential_id)
    .maybeSingle()

  if (!credential?.is_active || !roleAllowed(credential.role, options.allowedRoles)) {
    return { ok: false, response: errorResponse(req, 'Forbidden', 403) }
  }

  const ipHash = await sha256Hex(getClientIp(req))
  const userAgentHash = await sha256Hex(getUserAgent(req))
  await supabase
    .from('admin_sessions')
    .update({
      last_accessed_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      last_ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      access_count: (session.access_count ?? 0) + 1,
    })
    .eq('id', session.id)

  return {
    ok: true,
    context: {
      sessionId: session.id,
      credentialId: credential.id,
      role: credential.role as AdminRole,
      displayLabel: credential.display_label,
    },
  }
}

export async function rotateCsrfToken(supabase: any, sessionId: string) {
  const csrfToken = createSecretToken()
  await supabase
    .from('admin_sessions')
    .update({ csrf_token_hash: await sha256Hex(csrfToken) })
    .eq('id', sessionId)
  return csrfToken
}

export async function revokeSession(supabase: any, sessionId: string) {
  await supabase
    .from('admin_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId)
}
