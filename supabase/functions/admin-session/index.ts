import {
  auditLog,
  clearSessionCookie,
  createServiceClient,
  errorResponse,
  isAllowedOrigin,
  jsonResponse,
  optionsResponse,
  rotateCsrfToken,
  revokeSession,
  validateAdminSession,
} from '../_shared/adminSecurity.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return optionsResponse(req)

  if (!isAllowedOrigin(req)) {
    return errorResponse(req, 'Forbidden', 403)
  }

  const supabase = createServiceClient()

  if (req.method === 'GET') {
    const result = await validateAdminSession(req, supabase)
    if (!result.ok) return result.response

    const csrfToken = await rotateCsrfToken(supabase, result.context.sessionId)
    return jsonResponse(req, {
      valid: true,
      role: result.context.role,
      displayLabel: result.context.displayLabel,
      csrfToken,
    })
  }

  if (req.method === 'DELETE' || req.method === 'POST') {
    const result = await validateAdminSession(req, supabase, { requireCsrf: true })
    if (!result.ok) return result.response

    await revokeSession(supabase, result.context.sessionId)
    await auditLog(supabase, 'admin_logout', result.context)

    const response = jsonResponse(req, { success: true })
    response.headers.append('Set-Cookie', clearSessionCookie())
    return response
  }

  return errorResponse(req, 'Method not allowed', 405)
})
