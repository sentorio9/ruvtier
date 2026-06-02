# Security Hardening Runbook

This repository does not track real `.env` values, and admin credentials should
not be seeded by migrations. Complete these operational steps before deploying
or merging the hardening branches.

## Required Rotation

1. Rotate any Supabase keys that were committed to repository history. The
   publishable key is designed for clients, but any service-role key or secret
   copied alongside it must be rotated immediately.
2. Apply `supabase/migrations/20260519000100_revoke_seeded_admin_credentials.sql`.
   It removes previously seeded admin accounts, invalidates their sessions,
   denies pending approval requests, and removes linked Supabase auth users.
3. Create replacement admin accounts out of band through a privileged SQL
   session or internal bootstrap process. Do not commit usernames or passwords
   to migrations, seed files, docs, or tickets.
4. Remove stale approval emails or links generated before this change. Treat any
   previous admin approval URL as compromised.

## Admin Route

Set a non-obvious admin route at build time:

```sh
VITE_ADMIN_ROUTE="/change-this-private-admin-route"
```

Rules:

- It must start with `/`.
- Do not use obvious values such as `/admin`, `/dashboard`, `/cms`, or `/login`.
- The public site must not link to it.
- Admin routes inject `robots=noindex,nofollow,noarchive,nosnippet` at runtime.
- `public/robots.txt` blocks the default route. If `VITE_ADMIN_ROUTE` changes,
  update robots or generate robots at the hosting layer with the deployed route.

## Required Supabase Secrets

Set these with `supabase secrets set` for the deployed project:

```sh
supabase secrets set \
  SUPABASE_SERVICE_ROLE_KEY="..." \
  ADMIN_ALLOWED_ORIGINS="https://ruvtier.com,https://www.ruvtier.com" \
  ADMIN_COOKIE_SAMESITE="None" \
  SITE_URL="https://ruvtier.com" \
  PUBLIC_SITE_URL="https://ruvtier.com" \
  LOVABLE_API_KEY="..."
```

Optional override:

```sh
supabase secrets set LOVABLE_SEND_URL="https://api.lovable.dev"
```

Future Shopify values should also be Supabase secrets, not Vite client env:

```sh
supabase secrets set \
  SHOPIFY_STORE_DOMAIN="..." \
  SHOPIFY_ADMIN_ACCESS_TOKEN="..." \
  SHOPIFY_WEBHOOK_SECRET="..."
```

## Admin Uploads

Admin product image uploads are mediated by the `admin-upload` Edge Function.
The browser sends base64 JSON to the function, and the server enforces:

- authenticated admin session in an HttpOnly cookie
- CSRF header
- role check for `super_admin`, `admin`, or `editor`
- `product-images` bucket only
- controlled product folders only
- 5 MB maximum size
- JPEG, PNG, or WebP only
- magic-byte sniffing that must match the declared MIME type
- sanitized object names
- audit logging for upload and delete actions

The storage migration `20260602000120_admin_upload_hardening.sql` also caps the
`product-images` bucket to the same MIME and file-size policy. Product images
remain public storefront assets, but writes are no longer performed directly by
the browser Storage SDK.

## Hosting Headers

Configure these as HTTP response headers at the hosting/CDN layer. Meta tags
cannot enforce `frame-ancestors`.

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://open.er-api.com https://cdn.jsdelivr.net https://latest.currency-api.pages.dev https://ipapi.co; frame-src 'self'; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; upgrade-insecure-requests
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self), payment=(), usb=(), accelerometer=(), gyroscope=()
X-Robots-Tag: noindex, nofollow
```

Apply `X-Robots-Tag` only to admin route responses if your host supports route
specific headers. Do not apply it globally to public storefront pages.

## Verification

Run these checks after deployment:

```bash
npm audit
npx supabase db push --dry-run
npx supabase functions deploy admin-login admin-session admin-products admin-upload auth-email-hook process-email-queue
```

Manual smoke tests:

- Visit the public site and confirm no admin links are present.
- Visit the admin route while signed out and confirm only the login flow is reachable.
- Log in as admin and upload JPEG, PNG, and WebP product images.
- Confirm SVG, HTML, oversized files, and MIME-mismatched files are rejected.
- Confirm creating/editing a garment updates the product and normalized catalog rows.
- Create a new customer account and confirm the signup email is received.

Also enable GitHub secret scanning and review repository history before making
the repository broadly public.
