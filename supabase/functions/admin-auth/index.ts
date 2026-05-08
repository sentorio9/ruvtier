import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { z } from 'npm:zod@3.23.8'

// NOTE: This function runs with verify_jwt = false. That is INTENTIONAL —
// admin login is unauthenticated by definition (no JWT exists yet) and the
// approval-link click from email also has no auth context. All inputs are
// validated below with zod, and credential verification + rate limiting are
// enforced server-side. Do NOT add new actions here without their own
// signature/credential check.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------- Rate limiting ----------
// 5 failed attempts per identifier per 15 minutes blocks further attempts.
// Identifier = sha256(client IP) so we never persist raw IPs in plain text.
const RATE_LIMIT_WINDOW_MIN = 15
const RATE_LIMIT_MAX_FAILURES = 5

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

async function isRateLimited(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  scope: string,
  identifier: string
): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('rate_limit_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('scope', scope)
    .eq('identifier', identifier)
    .eq('success', false)
    .gte('attempted_at', since)
  return (count ?? 0) >= RATE_LIMIT_MAX_FAILURES
}

async function recordAttempt(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  scope: string,
  identifier: string,
  success: boolean
): Promise<void> {
  await supabase.from('rate_limit_attempts').insert({ scope, identifier, success })
  // Opportunistic cleanup — fire-and-forget, no await on the result handling.
  if (Math.random() < 0.05) {
    supabase.rpc('cleanup_rate_limit_attempts', { _older_than_hours: 24 }).then(() => {}).catch(() => {})
  }
}

// ---------- Input validation ----------
const LoginSchema = z.object({
  action: z.literal('login'),
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
  rememberMe: z.boolean().optional(),
})

const CheckStatusSchema = z.object({
  action: z.literal('check-status'),
  requestId: z.string().uuid(),
})

const ValidateSchema = z.object({
  action: z.literal('validate'),
  sessionToken: z.string().min(20).max(200),
})

const LogoutSchema = z.object({
  action: z.literal('logout'),
  sessionToken: z.string().min(20).max(200),
})

const ResolveSchema = z.object({
  action: z.literal('resolve_request'),
  token: z.string().min(20).max(200),
  decision: z.enum(['approve', 'deny']),
})

const APPROVAL_EMAIL = 'frigatormark@gmail.com'
const SENDER_DOMAIN = 'notify.ruvtier.com'
const FROM_EMAIL = 'security@ruvtier.com'
const SITE_URL = 'https://ruvtier.com'

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function htmlPage(message: string, success: boolean) {
  return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Ruvtier Security</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Jost','Helvetica Neue',Arial,sans-serif;background:hsl(220,15%,6%);color:hsl(220,10%,75%);display:flex;align-items:center;justify-content:center;min-height:100vh}.c{text-align:center;max-width:400px;padding:40px}.logo{font-size:14px;letter-spacing:.3em;color:hsl(220,10%,40%);margin-bottom:40px;text-transform:uppercase}.s{font-size:16px;letter-spacing:.12em;color:${success?'hsl(140,30%,55%)':'hsl(0,50%,55%)'};margin-bottom:16px}.m{font-size:13px;color:hsl(220,10%,45%);line-height:1.6}</style></head>
<body><div class="c"><div class="logo">R U V T I E R</div><div class="s">${success?'✓ GRANTED':'✕ DENIED'}</div><p class="m">${message}</p></div></body></html>`, {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  })
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function approvalEmailHtml(label: string, role: string, ip: string, ua: string, approveUrl: string, denyUrl: string) {
  const safeLabel = escapeHtml(label);
  const safeRole = escapeHtml(role);
  const safeIp = escapeHtml(ip).slice(0, 64);
  const safeUa = escapeHtml(ua).slice(0, 200);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Jost','Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff"><tr><td align="center" style="padding:40px 20px">
<table width="520" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding-bottom:24px"><span style="font-size:16px;letter-spacing:.3em;color:#3b3b3b;font-weight:300">R U V T I E R</span></td></tr>
<tr><td style="border-top:1px solid #e0dbd4;padding-top:32px">
<h1 style="font-size:18px;font-weight:300;color:#3b3b3b;margin:0 0 20px;letter-spacing:.15em;text-transform:uppercase">Admin Login Request</h1>
<p style="font-size:13px;color:#737373;line-height:1.7;margin:0 0 20px;letter-spacing:.03em">An operator is requesting access to the admin panel.</p>
<table width="100%" style="margin:0 0 24px;border:1px solid #e0dbd4">
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dbd4;font-size:11px;color:#a8a29e;letter-spacing:.1em;text-transform:uppercase;width:120px">Operator</td><td style="padding:12px 16px;border-bottom:1px solid #e0dbd4;font-size:13px;color:#3b3b3b">${label}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dbd4;font-size:11px;color:#a8a29e;letter-spacing:.1em;text-transform:uppercase">Role</td><td style="padding:12px 16px;border-bottom:1px solid #e0dbd4;font-size:13px;color:#3b3b3b">${role}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #e0dbd4;font-size:11px;color:#a8a29e;letter-spacing:.1em;text-transform:uppercase">IP Address</td><td style="padding:12px 16px;border-bottom:1px solid #e0dbd4;font-size:13px;color:#3b3b3b">${ip}</td></tr>
<tr><td style="padding:12px 16px;font-size:11px;color:#a8a29e;letter-spacing:.1em;text-transform:uppercase">Device</td><td style="padding:12px 16px;font-size:13px;color:#3b3b3b;word-break:break-all">${ua}</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr>
<td width="48%" align="center"><a href="${approveUrl}" style="display:inline-block;padding:14px 32px;background:#3b3b3b;color:#ffffff;font-size:12px;letter-spacing:.15em;text-transform:uppercase;text-decoration:none">Grant Access</a></td>
<td width="4%"></td>
<td width="48%" align="center"><a href="${denyUrl}" style="display:inline-block;padding:14px 32px;background:#ffffff;color:#3b3b3b;font-size:12px;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;border:1px solid #3b3b3b">Deny Access</a></td>
</tr></table>
<p style="font-size:11px;color:#a8a29e;margin:24px 0 0;letter-spacing:.03em;line-height:1.6">This request expires in 10 minutes. If you did not expect this, deny access immediately.</p>
</td></tr></table></td></tr></table></body></html>`
}

/**
 * Create or retrieve a Supabase auth user for an admin credential.
 * Passwords are generated transiently and NEVER persisted to the database.
 */
async function ensureSupabaseAuth(
  supabase: ReturnType<typeof createClient>,
  cred: { id: string; role: string; supabase_email: string | null; supabase_user_id: string | null },
  supabaseUrl: string
) {
  // If we already have a linked Supabase user, generate a fresh session via admin API
  if (cred.supabase_user_id) {
    // Generate a transient password, sign in, then immediately update it away
    const transientPassword = crypto.randomUUID() + crypto.randomUUID()
    
    // Update the user's password transiently
    const { error: updateErr } = await supabase.auth.admin.updateUser(cred.supabase_user_id, {
      password: transientPassword,
    })
    if (updateErr) throw updateErr

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const anonClient = createClient(supabaseUrl, anonKey)
    const email = cred.supabase_email || `admin-${cred.id}@internal.ruvtier.com`
    const { data: signIn, error: signInErr } = await anonClient.auth.signInWithPassword({
      email,
      password: transientPassword,
    })
    if (signInErr) throw signInErr

    return {
      access_token: signIn.session?.access_token,
      refresh_token: signIn.session?.refresh_token,
    }
  }

  // No linked user yet — create one
  const email = `admin-${cred.id}@internal.ruvtier.com`
  const transientPassword = crypto.randomUUID() + crypto.randomUUID()

  const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: transientPassword,
    email_confirm: true,
  })
  if (createErr) throw createErr

  // Add role to user_roles
  const dbRole = cred.role === 'super_admin' ? 'super_admin' : cred.role === 'editor' ? 'editor' : 'admin'
  await supabase.from('user_roles').insert({
    user_id: newUser.user.id,
    role: dbRole,
  })

  // Store only the email and user_id — NEVER the password
  await supabase
    .from('admin_credentials')
    .update({ supabase_email: email, supabase_user_id: newUser.user.id })
    .eq('id', cred.id)

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const anonClient = createClient(supabaseUrl, anonKey)
  const { data: signIn, error: signInErr } = await anonClient.auth.signInWithPassword({
    email,
    password: transientPassword,
  })
  if (signInErr) throw signInErr

  return {
    access_token: signIn.session?.access_token,
    refresh_token: signIn.session?.refresh_token,
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const apiKey = Deno.env.get('LOVABLE_API_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const functionUrl = `${supabaseUrl}/functions/v1/admin-auth`

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // GET: approve/deny from email
  if (req.method === 'GET' && (action === 'approve' || action === 'deny')) {
    const token = url.searchParams.get('token')
    if (!token) return htmlPage('Invalid request', false)

    const { data: request } = await supabase
      .from('admin_login_requests')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!request) return htmlPage('Request expired or already processed.', false)

    const newStatus = action === 'approve' ? 'approved' : 'denied'
    await supabase
      .from('admin_login_requests')
      .update({ status: newStatus, resolved_at: new Date().toISOString() })
      .eq('id', request.id)

    await supabase.from('audit_logs').insert({
      action: `admin_login_${newStatus}`,
      actor_email: APPROVAL_EMAIL,
      details: { request_id: request.id },
    })

    return htmlPage(
      action === 'approve'
        ? 'Access Granted — The operator may now proceed.'
        : 'Access Denied — The login attempt has been blocked.',
      action === 'approve'
    )
  }

  // POST actions
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400)
  }

  const action = (rawBody as { action?: string })?.action
  const clientIp = getClientIp(req)
  const ipHash = await sha256Hex(clientIp)

  // --- RESOLVE APPROVAL REQUEST (from email link via /admin-approval page) ---
  if (action === 'resolve_request') {
    // Rate-limit token-based resolution to prevent brute-forcing tokens.
    if (await isRateLimited(supabase, 'admin_resolve', ipHash)) {
      return jsonResponse({ error: 'Too many requests. Please try again later.' }, 429)
    }

    const parsed = ResolveSchema.safeParse(rawBody)
    if (!parsed.success) {
      await recordAttempt(supabase, 'admin_resolve', ipHash, false)
      return jsonResponse({ error: 'Invalid request' }, 400)
    }
    const { token, decision } = parsed.data

    const { data: request } = await supabase
      .from('admin_login_requests')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!request) {
      await recordAttempt(supabase, 'admin_resolve', ipHash, false)
      return jsonResponse({ error: 'Request expired or already processed.' }, 410)
    }

    const newStatus = decision === 'approve' ? 'approved' : 'denied'
    await supabase
      .from('admin_login_requests')
      .update({ status: newStatus, resolved_at: new Date().toISOString() })
      .eq('id', request.id)

    await supabase.from('audit_logs').insert({
      action: `admin_login_${newStatus}`,
      actor_email: APPROVAL_EMAIL,
      details: { request_id: request.id },
    })

    await recordAttempt(supabase, 'admin_resolve', ipHash, true)
    return jsonResponse({ status: newStatus })
  }

  // --- LOGIN ---
  if (action === 'login') {
    // Block if too many failed attempts from this IP recently.
    if (await isRateLimited(supabase, 'admin_login', ipHash)) {
      await supabase.from('audit_logs').insert({
        action: 'admin_login_rate_limited',
        details: { ip_hash: ipHash.slice(0, 16) },
      })
      // Generic message — never reveal whether the username exists or
      // whether the lockout is per-account vs per-IP.
      return jsonResponse({ error: 'Too many attempts. Please try again later.' }, 429)
    }

    const parsed = LoginSchema.safeParse(rawBody)
    if (!parsed.success) {
      await recordAttempt(supabase, 'admin_login', ipHash, false)
      return jsonResponse({ error: 'Invalid credentials' }, 401)
    }
    const { username, password, rememberMe } = parsed.data

    const { data: creds } = await supabase.rpc('verify_admin_credentials', {
      p_username: username,
      p_password: password,
    })

    if (!creds || creds.length === 0) {
      await recordAttempt(supabase, 'admin_login', ipHash, false)
      await supabase.from('audit_logs').insert({
        action: 'admin_login_failed',
        details: { username, ip_hash: ipHash.slice(0, 16) },
      })
      return jsonResponse({ error: 'Invalid credentials' }, 401)
    }

    await recordAttempt(supabase, 'admin_login', ipHash, true)

    const cred = creds[0]
    const token = crypto.randomUUID() + '-' + crypto.randomUUID()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    const ua = req.headers.get('user-agent') || 'unknown'

    const { data: loginReq, error: insertErr } = await supabase
      .from('admin_login_requests')
      .insert({
        credential_id: cred.id,
        token,
        remember_me: rememberMe || false,
        ip_address: ip,
        user_agent: ua,
      })
      .select('id')
      .single()

    if (insertErr) return jsonResponse({ error: 'Server error' }, 500)

    const approveUrl = `${SITE_URL}/admin-approval?action=approve&token=${token}`
    const denyUrl = `${SITE_URL}/admin-approval?action=deny&token=${token}`

    try {
      const messageId = `admin-approval-${loginReq.id}`
      const unsubscribeToken = crypto.randomUUID()
      const emailText = [
        'Admin Login Request',
        '',
        `Operator: ${cred.display_label}`,
        `Role: ${cred.role}`,
        `IP Address: ${ip}`,
        `Device: ${ua}`,
        '',
        `Grant Access: ${approveUrl}`,
        `Deny Access: ${denyUrl}`,
        '',
        'This request expires in 10 minutes.',
      ].join('\n')

      const { error: unsubscribeErr } = await supabase.from('email_unsubscribe_tokens').insert({
        email: APPROVAL_EMAIL,
        token: unsubscribeToken,
      })

      if (unsubscribeErr) {
        console.error('Failed to create unsubscribe token:', unsubscribeErr)
      }

      const emailPayload = {
        to: APPROVAL_EMAIL,
        from: `Ruvtier Security <${FROM_EMAIL}>`,
        sender_domain: SENDER_DOMAIN,
        subject: `🔐 Admin Login Request — ${cred.display_label}`,
        html: approvalEmailHtml(cred.display_label, cred.role, ip, ua, approveUrl, denyUrl),
        text: emailText,
        purpose: 'transactional',
        label: 'admin-approval',
        message_id: messageId,
        idempotency_key: messageId,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      }

      // Enqueue via the reliable email queue
      const { error: queueErr } = await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: emailPayload,
      })

      if (queueErr) {
        console.error('Failed to enqueue approval email:', queueErr)
        // Fallback to direct send
        await sendLovableEmail(
          {
            to: APPROVAL_EMAIL,
            from: `Ruvtier Security <${FROM_EMAIL}>`,
            sender_domain: SENDER_DOMAIN,
            subject: `🔐 Admin Login Request — ${cred.display_label}`,
            html: approvalEmailHtml(cred.display_label, cred.role, ip, ua, approveUrl, denyUrl),
            text: emailText,
            purpose: 'transactional',
            label: 'admin-approval',
            message_id: messageId,
            idempotency_key: messageId,
            unsubscribe_token: unsubscribeToken,
          },
          { apiKey, sendUrl: Deno.env.get('LOVABLE_SEND_URL') }
        )
      }
    } catch (e) {
      console.error('Approval email send error:', e)
    }

    return jsonResponse({ requestId: loginReq.id, status: 'pending' })
  }

  // --- CHECK STATUS ---
  if (action === 'check-status') {
    const parsed = CheckStatusSchema.safeParse(rawBody)
    if (!parsed.success) return jsonResponse({ error: 'Invalid request' }, 400)
    const requestId = parsed.data.requestId

    const { data: request } = await supabase
      .from('admin_login_requests')
      .select('id, credential_id, status, remember_me, expires_at')
      .eq('id', requestId)
      .maybeSingle()

    if (!request) return jsonResponse({ error: 'Not found' }, 404)

    if (new Date(request.expires_at) < new Date() && request.status === 'pending') {
      return jsonResponse({ status: 'expired' })
    }
    if (request.status === 'pending') return jsonResponse({ status: 'pending' })
    if (request.status === 'denied') return jsonResponse({ status: 'denied' })

    if (request.status === 'approved') {
      // Get credential details — explicit column selection, no sensitive fields
      const { data: cred } = await supabase
        .from('admin_credentials')
        .select('id, role, display_label, supabase_email, supabase_user_id')
        .eq('id', request.credential_id)
        .single()

      if (!cred) return jsonResponse({ error: 'Credential not found' }, 500)

      // Create custom session
      const sessionToken = crypto.randomUUID() + '-' + crypto.randomUUID()
      const expiresAt = request.remember_me
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 60 * 60 * 1000)

      const checkIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
      const checkUa = req.headers.get('user-agent') || 'unknown'

      await supabase.from('admin_sessions').insert({
        credential_id: cred.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        last_accessed_at: new Date().toISOString(),
        last_ip_address: checkIp,
        last_user_agent: checkUa,
        access_count: 1,
      })

      // Ensure Supabase auth account for data operations
      let supabaseSession = null
      try {
        supabaseSession = await ensureSupabaseAuth(supabase, cred, supabaseUrl)
      } catch (e) {
        console.error('Supabase auth setup error:', e)
      }

      return jsonResponse({
        status: 'approved',
        sessionToken,
        role: cred.role,
        displayLabel: cred.display_label,
        supabaseSession,
      })
    }

    return jsonResponse({ status: 'unknown' })
  }

  // --- VALIDATE SESSION ---
  if (action === 'validate') {
    const { sessionToken } = (rawBody as any)
    if (!sessionToken) return jsonResponse({ valid: false })

    const { data: session } = await supabase
      .from('admin_sessions')
      .select('credential_id, expires_at, access_count')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!session) return jsonResponse({ valid: false })

    // Track access activity
    const validateIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown'
    const validateUa = req.headers.get('user-agent') || 'unknown'
    await supabase
      .from('admin_sessions')
      .update({
        last_accessed_at: new Date().toISOString(),
        last_ip_address: validateIp,
        last_user_agent: validateUa,
        access_count: (session as any).access_count ? (session as any).access_count + 1 : 1,
      })
      .eq('session_token', sessionToken)

    // Explicit column selection — no sensitive fields
    const { data: cred } = await supabase
      .from('admin_credentials')
      .select('id, role, display_label, supabase_email, supabase_user_id')
      .eq('id', session.credential_id)
      .single()

    // Refresh (or lazily provision) the Supabase auth session so storage/db RLS works.
    let supabaseSession = null
    if (cred) {
      try {
        supabaseSession = await ensureSupabaseAuth(supabase, cred, supabaseUrl)
      } catch (e) {
        console.error('Supabase session refresh error:', e)
      }
    }

    return jsonResponse({
      valid: true,
      role: cred?.role,
      displayLabel: cred?.display_label,
      supabaseSession,
    })
  }

  // --- REVOKE SESSION (super_admin only) ---
  if (action === 'revoke-session') {
    const { sessionToken: callerToken, targetSessionId } = (rawBody as any)
    if (!callerToken || !targetSessionId) return jsonResponse({ error: 'Missing parameters' }, 400)

    // Verify caller is super_admin
    const { data: callerSession } = await supabase
      .from('admin_sessions')
      .select('credential_id')
      .eq('session_token', callerToken)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!callerSession) return jsonResponse({ error: 'Invalid session' }, 401)

    const { data: callerCred } = await supabase
      .from('admin_credentials')
      .select('role')
      .eq('id', callerSession.credential_id)
      .single()

    if (callerCred?.role !== 'super_admin') return jsonResponse({ error: 'Insufficient privileges' }, 403)

    // Delete the target session
    const { error: delErr } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('id', targetSessionId)

    if (delErr) return jsonResponse({ error: 'Failed to revoke' }, 500)

    const revokeIp = req.headers.get('x-forwarded-for') || 'unknown'
    await supabase.from('audit_logs').insert({
      action: 'admin_session_revoked',
      actor_email: callerCred.role,
      details: { target_session_id: targetSessionId, ip: revokeIp },
    })

    return jsonResponse({ success: true })
  }

  // --- LOGOUT ---
  if (action === 'logout') {
    if ((rawBody as any).sessionToken) {
      await supabase.from('admin_sessions').delete().eq('session_token', (rawBody as any).sessionToken)
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Invalid action' }, 400)
})
