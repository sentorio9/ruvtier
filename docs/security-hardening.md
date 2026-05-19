# Security Hardening Runbook

This repository no longer tracks `.env`, and admin credentials are no longer seeded by migrations. Complete these operational steps before deploying the hardening branch.

## Required Rotation

1. Rotate any Supabase keys that were committed to repository history. The publishable key is designed for clients, but history exposure means every environment should be reviewed and any service-role or secret keys should be rotated immediately if they were ever copied alongside it.
2. Apply `supabase/migrations/20260519000100_revoke_seeded_admin_credentials.sql`. It removes the previously seeded admin accounts, invalidates their sessions, denies pending approval requests, and removes linked Supabase auth users.
3. Create replacement admin accounts out of band through a privileged SQL session or an internal bootstrap process. Do not commit usernames or passwords to migrations, seed files, docs, or tickets.
4. Remove stale approval emails or links generated before this change. Treat any previous admin approval URL as compromised.

## Hosting Headers

Configure these as HTTP response headers at the hosting/CDN layer. Meta tags cannot enforce `frame-ancestors`.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://open.er-api.com https://cdn.jsdelivr.net https://latest.currency-api.pages.dev https://ipapi.co; frame-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), accelerometer=(), gyroscope=()
```

If Lovable preview embedding is not needed in production, change `frame-ancestors 'self'` to `frame-ancestors 'none'`.

## Admin Auth Follow-up

The client now keeps admin session tokens in `sessionStorage` only and disables persistent "remember me" sessions. The stronger long-term fix is to move admin session state into an HttpOnly, Secure, SameSite cookie issued by the Edge Function so JavaScript cannot read the token.

The `admin-auth` Edge Function should also be tightened at deployment time:

- Restrict CORS to `https://ruvtier.com`, `https://www.ruvtier.com`, and any explicit preview/admin origins.
- Keep `Cache-Control: no-store` on every admin-auth response.
- Avoid GET endpoints that mutate approval state. Approval and denial should be POST-only and protected by an authenticated admin session or a short-lived one-time challenge.

## Verification

Run these checks after deployment:

```bash
npm audit
npx supabase db push --dry-run
npx supabase functions deploy admin-auth
```

Also enable GitHub secret scanning and review repository history for any additional leaked secrets before making the repository broadly public.
