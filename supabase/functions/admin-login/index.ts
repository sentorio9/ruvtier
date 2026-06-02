import { z } from 'npm:zod@3.23.8'
import {
  auditLog,
  createSecretToken,
  createServiceClient,
  errorResponse,
  getClientIp,
  getUserAgent,
  isAllowedOrigin,
  isRateLimited,
  jsonResponse,
  optionsResponse,
  parseJson,
  recordRateLimitAttempt,
  sessionCookie,
  sha256Hex,
} from '../_shared/adminSecurity.ts'

const LoginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
  rememberMe: z.boolean().optional().default(false),
})

const SESSION_SECONDS = 60 * 60
const REMEMBER_SECONDS = 7 * 24 * 60 * 60
const ADMIN_PANEL_ROLES = new Set(['super_admin', 'admin', 'editor', 'support_viewer'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  if (!isAllowedOrigin(req)) {
    return errorResponse(req, 'Forbidden', 403)
  }

  if (req.method !== 'POST') {
    return errorResponse(req, 'Method not allowed', 405)
  }

  const rawBody = await parseJson(req)
  const parsed = LoginSchema.safeParse(rawBody)
  const supabase = createServiceClient()
  const ipHash = await sha256Hex(getClientIp(req))
  const usernameHash = parsed.success
    ? await sha256Hex(parsed.data.username.toLowerCase())
    : 'invalid-request'
  const rateIdentifier = `${ipHash}:${usernameHash}`

  if (await isRateLimited(supabase, 'admin_login', rateIdentifier)) {
    await auditLog(supabase, 'admin_login_rate_limited', {}, { ip_hash: ipHash.slice(0, 16) })
    return errorResponse(req, 'Too many attempts. Please try again later.', 429)
  }

  if (!parsed.success) {
    await recordRateLimitAttempt(supabase, 'admin_login', rateIdentifier, false, { reason: 'invalid_payload' })
    return errorResponse(req, 'Invalid credentials', 401)
  }

  const { username, password, rememberMe } = parsed.data
  const { data: verified, error } = await supabase.rpc('verify_admin_login', {
    p_username: username,
    p_password: password,
  })

  const credential = Array.isArray(verified) ? verified[0] : null
  if (error || !credential?.credential_id || !ADMIN_PANEL_ROLES.has(credential.role)) {
    await recordRateLimitAttempt(supabase, 'admin_login', rateIdentifier, false, { username_hash: usernameHash })
    await auditLog(supabase, 'admin_login_failed', {}, { username_hash: usernameHash, ip_hash: ipHash.slice(0, 16) })
    return errorResponse(req, 'Invalid credentials', 401)
  }

  await recordRateLimitAttempt(supabase, 'admin_login', rateIdentifier, true, { username_hash: usernameHash })

  const sessionToken = createSecretToken()
  const csrfToken = createSecretToken()
  const sessionTokenHash = await sha256Hex(sessionToken)
  const csrfTokenHash = await sha256Hex(csrfToken)
  const maxAge = rememberMe ? REMEMBER_SECONDS : SESSION_SECONDS
  const expiresAt = new Date(Date.now() + maxAge * 1000).toISOString()
  const userAgentHash = await sha256Hex(getUserAgent(req))

  const { data: session, error: sessionError } = await supabase
    .from('admin_sessions')
    .insert({
      credential_id: credential.credential_id,
      session_token: sessionTokenHash,
      session_token_hash: sessionTokenHash,
      csrf_token_hash: csrfTokenHash,
      expires_at: expiresAt,
      remember_me: rememberMe,
      created_ip_hash: ipHash,
      last_ip_hash: ipHash,
      user_agent_hash: userAgentHash,
      last_accessed_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      access_count: 1,
      role_snapshot: credential.role,
      display_label_snapshot: credential.display_label,
    })
    .select('id')
    .single()

  if (sessionError || !session) {
    await auditLog(supabase, 'admin_login_session_error', {}, { error: sessionError?.message ?? 'unknown' })
    return errorResponse(req, 'Unable to create session', 500)
  }

  await auditLog(
    supabase,
    'admin_login_success',
    {
      sessionId: session.id,
      credentialId: credential.credential_id,
      role: credential.role,
      displayLabel: credential.display_label,
    },
    { ip_hash: ipHash.slice(0, 16) },
  )

  const response = jsonResponse(req, {
    authenticated: true,
    role: credential.role,
    displayLabel: credential.display_label,
    csrfToken,
    expiresAt,
  })
  response.headers.append('Set-Cookie', sessionCookie(sessionToken, maxAge))
  return response
})
