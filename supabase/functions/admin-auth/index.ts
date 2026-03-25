import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const APPROVAL_EMAIL = 'frigatormark@gmail.com'
const SENDER_DOMAIN = 'notify.ruvtier.com'
const FROM_EMAIL = 'security@ruvtier.com'

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
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function approvalEmailHtml(label: string, role: string, ip: string, ua: string, approveUrl: string, denyUrl: string) {
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

  const body = await req.json()

  // --- LOGIN ---
  if (body.action === 'login') {
    const { username, password, rememberMe } = body
    if (!username || !password) return jsonResponse({ error: 'Credentials required' }, 400)

    const { data: creds } = await supabase.rpc('verify_admin_credentials', {
      p_username: username,
      p_password: password,
    })

    if (!creds || creds.length === 0) {
      await supabase.from('audit_logs').insert({
        action: 'admin_login_failed',
        details: { username, ip: req.headers.get('x-forwarded-for') || 'unknown' },
      })
      return jsonResponse({ error: 'Invalid credentials' }, 401)
    }

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

    const approveUrl = `${functionUrl}?action=approve&token=${token}`
    const denyUrl = `${functionUrl}?action=deny&token=${token}`

    try {
      const emailPayload = {
        to: APPROVAL_EMAIL,
        from: `Ruvtier Security <${FROM_EMAIL}>`,
        sender_domain: SENDER_DOMAIN,
        subject: `🔐 Admin Login Request — ${cred.display_label}`,
        html: approvalEmailHtml(cred.display_label, cred.role, ip, ua, approveUrl, denyUrl),
        purpose: 'transactional',
        label: 'admin-approval',
        message_id: `admin-approval-${loginReq.id}`,
        apiKey,
        sendUrl: Deno.env.get('LOVABLE_SEND_URL'),
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
            purpose: 'transactional',
            label: 'admin-approval',
            message_id: `admin-approval-${loginReq.id}`,
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
  if (body.action === 'check-status') {
    const { requestId } = body
    if (!requestId) return jsonResponse({ error: 'Request ID required' }, 400)

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
      // Get credential details
      const { data: cred } = await supabase
        .from('admin_credentials')
        .select('id, role, display_label, supabase_email, supabase_password, supabase_user_id')
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
  if (body.action === 'validate') {
    const { sessionToken } = body
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

    const { data: cred } = await supabase
      .from('admin_credentials')
      .select('role, display_label, supabase_email, supabase_password')
      .eq('id', session.credential_id)
      .single()

    // Also refresh Supabase session
    let supabaseSession = null
    if (cred?.supabase_email && cred?.supabase_password) {
      try {
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
        const anonClient = createClient(supabaseUrl, anonKey)
        const { data: signIn } = await anonClient.auth.signInWithPassword({
          email: cred.supabase_email,
          password: cred.supabase_password,
        })
        if (signIn?.session) {
          supabaseSession = {
            access_token: signIn.session.access_token,
            refresh_token: signIn.session.refresh_token,
          }
        }
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
  if (body.action === 'revoke-session') {
    const { sessionToken: callerToken, targetSessionId } = body
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
  if (body.action === 'logout') {
    if (body.sessionToken) {
      await supabase.from('admin_sessions').delete().eq('session_token', body.sessionToken)
    }
    return jsonResponse({ success: true })
  }

  return jsonResponse({ error: 'Invalid action' }, 400)
})

async function ensureSupabaseAuth(
  supabase: ReturnType<typeof createClient>,
  cred: { id: string; role: string; supabase_email: string | null; supabase_password: string | null; supabase_user_id: string | null },
  supabaseUrl: string
) {
  let email = cred.supabase_email
  let password = cred.supabase_password

  if (!email || !password) {
    email = `admin-${cred.id}@internal.ruvtier.com`
    password = crypto.randomUUID() + crypto.randomUUID()

    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createErr) throw createErr

    // Add role to user_roles
    const dbRole = cred.role === 'super_admin' ? 'super_admin' : 'admin'
    await supabase.from('user_roles').insert({
      user_id: newUser.user.id,
      role: dbRole,
    })

    await supabase
      .from('admin_credentials')
      .update({ supabase_email: email, supabase_password: password, supabase_user_id: newUser.user.id })
      .eq('id', cred.id)
  }

  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const anonClient = createClient(supabaseUrl, anonKey)
  const { data: signIn, error: signInErr } = await anonClient.auth.signInWithPassword({ email, password })
  if (signInErr) throw signInErr

  return {
    access_token: signIn.session?.access_token,
    refresh_token: signIn.session?.refresh_token,
  }
}
