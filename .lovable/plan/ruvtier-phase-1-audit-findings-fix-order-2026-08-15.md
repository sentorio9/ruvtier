# RUVTIER — Phase 1 Audit (findings + fix order)

No code changed. Findings below come from reading the repo, the migrations, and live database/storage state. Visual layer untouched in Phase 2.

## Checklist A — Security

| Item | Status | Location | Fix |
|---|---|---|---|
| A1 Hide API keys | Pass | `.env.example`, `src/integrations/supabase/client.ts` | Only publishable key client-side; all Stripe/service keys read via `Deno.env` in edge functions |
| A2 Purge Git secrets | Can't tell | repo history | Needs a history scan (gitleaks) outside the sandbox; `.env` is not tracked |
| A3 Anon key + RLS | Partial fail | all `public` tables | RLS is ON for all 27 tables and anon has no permissive policy on sensitive tables, so no data leaks today. But table-level `GRANT SELECT/INSERT/UPDATE` to `anon` exists on every table (from `20260612200217`), leaving zero margin: any future permissive policy instantly becomes public. Revoke anon grants except where an anon policy exists (`products`, `product_variants`, `site_content`, `site_settings`, plus insert-only on `appointment_requests`, `preorder_requests`, `maintenance_subscribers`) |
| A4 RLS policies | Pass, one gap | `pg_policies` | Customer/admin scoping is correct; private-list tables are insert-only for public. Gap: `products` anon SELECT returns all columns, including `stock_quantity` and `allocated_count` (see C4) |
| A5 Minimise sensitive data | Pass | `orders`, `payment_events` | No card data stored; Stripe holds it |
| A6 Server-side auth on mutations | Pass | migrations + `admin-auth` | Admin writes gated by `is_admin()`/`has_role()` in RLS, not React |
| A7 Record-level lock | Pass | `orders`, `carts`, `profiles` policies | Scoped by `auth.uid()` |
| A8 Field tampering | Pass | `create-stripe-checkout/index.ts` | Amount recomputed from DB rows; client total ignored |
| A9 Sessions | Pass | `useAuth.tsx` | Supabase SDK only |
| A10 Password hashing | Pass | Supabase Auth | No custom credential storage for customers. Note: `admin_credentials` is a separate server-verified table (service_role only) |
| A11 Rate limit auth | Partial | `rate_limit_attempts` | Table exists and admin login is throttled; customer signin/signup/reset rely on provider defaults. Confirm Auth rate limits in backend settings |
| A12 Bot protection | Fail | subscribe/preorder/appointment forms | Honeypot + time-trap exists on contact/maintenance only. Add the same guard to every public form, then Turnstile on allocation (see C6) |
| A13 Parameterised queries | Pass | edge functions | Supabase client builders only, no string SQL |
| A14 Server-side validation | Pass | RLS `WITH CHECK` constraints | Length/format/enum checks enforced in policy |
| A15 Escape user content | Pass | `src` | Only `dangerouslySetInnerHTML` is in shadcn `chart.tsx` with generated CSS |
| A16 File uploads | Fail | `storage.buckets` | `product-images` and `site-images` are public with **no** `file_size_limit` and **no** `allowed_mime_types`. Set 5 MB + image MIME allowlist |
| A17 Trim API responses | Fail | `src/hooks/useProducts.tsx` `.select("*")` | Select explicit public columns |
| A18 Security headers | Partial | `index.html` meta CSP | CSP present as meta tag; `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors` cannot be set from a meta tag — need Cloudflare Transform Rules (C1) |
| A19 Force HTTPS | Pass | hosting + `upgrade-insecure-requests` | Confirm HSTS at Cloudflare |
| A20 Dependency scan | Not run | — | Run the dependency scanner in Phase 2 and report |
| A21 Payment webhooks | Pass | `stripe-webhook/index.ts` | Signature verified, idempotency via `payment_events` |
| A22 Checkout amounts | Pass | `create-stripe-checkout` | Server-computed |

## Checklist B — Legal

| Item | Status | Location | Fix |
|---|---|---|---|
| B1 Privacy policy | Pass | `src/pages/PrivacyPolicy.tsx` | Exists, footer-linked, site-specific |
| B2 Names data collected | Partial | same | Add sentences covering `appointment_requests`, `preorder_requests`, `maintenance_subscribers`, `carts` |
| B3 AI disclosure | N/A | no AI calls in `src` or functions | State N/A in policy |
| B4 Names third parties | Fail | same | Policy omits Stripe, the transactional mail provider, and the geo/currency endpoints the app calls (`ipapi.co`, `open.er-api.com`, `currency-api`, `cdn.jsdelivr.net`). All appear in the CSP `connect-src`, so they receive visitor IPs |
| B5 Deletion promises real | Fail | no deletion code found | Add an account/data deletion request path (edge function + Client Lounge entry) or soften the promise to a verified email process |
| B6 Buckets/tables not public | Fail (buckets) | `storage.buckets` | Both buckets public and unconstrained; campaign imagery with people is readable by anyone. Split: keep a public downsized bucket, move originals to a private bucket with signed URLs |
| B7 Real scarcity | Pass | `productAvailability.ts` | Derived from DB stock, no hardcoded counters |
| B8/B9 Subscriptions | N/A | no recurring products | — |
| B10 Chatbot | N/A | none | — |
| B11 Cookie consent | Pass | `CookieConsent.tsx` | No analytics/pixels load at all today; banner already gates |
| B12 GDPR basics | Partial | Privacy §4 | Lawful basis stated; needs the working request/deletion route from B5 |
| B13 Returns/14-day | Pass | `ReturnsPolicy.tsx` | 14-day cancellation stated; link it from checkout when Stripe goes live |
| B14 Terms | Partial | `TermsAndConditions.tsx` | Add allocation/reserve mechanics clauses |

## Checklist C — Scraper resistance

| Item | Status | Location | Fix |
|---|---|---|---|
| C1 Edge protection | Not configured | Cloudflare | Step-by-step settings supplied in Phase 2 (WAF, Bot Fight, rate rules, HSTS, security headers via Transform Rules) |
| C2 Anon REST surface | Fail | `products` policy | Anon can dump the full catalog with all columns. Restrict to a public column set (via a view or column grants) |
| C3 Rate limit reads | Fail | — | Cloudflare rate rules on `/rest/v1/*` plus per-IP caps |
| C4 Blur scarcity | Fail | `stock_quantity`, `allocated_count` sent to client | Expose only a tier (`available`/`low`/`closed`) computed server-side; strip integers from the anon column set |
| C5 Protect imagery | Fail | public buckets | Downsized public renditions, private originals with signed URLs, hotlink protection at Cloudflare |
| C6 Bot-proof the drop | Fail | `PrivateAccessDrawer`, `AllocationRequestDrawer` | Turnstile + per-email/IP caps on allocation submits |
| C7 Honeypots | Partial | contact + maintenance only | Extend to all public forms; add a hidden link trap |
| C8 robots.txt | Fail | `public/robots.txt` | Currently `Allow: /` with nothing disallowed; disallow admin/account/API paths |
| C9 Monitoring | Not configured | — | Cloudflare Security Analytics alert + a lightweight request-pattern log |

## Ranked fix order (Phase 2, batches of 2–3)

1. **B6 + A16** — lock down storage buckets (private originals, MIME/size limits). Silent, ongoing exposure.
2. **A3** — revoke blanket `anon` table grants, keep only what policies need.
3. **C2 + C4 + A17** — public column set for products; stop shipping stock integers; explicit `select()` in hooks.
4. **C8 + C7 + A12** — robots.txt hygiene, honeypots on all public forms, hidden link trap.
5. **C6** — Turnstile plus per-email/IP caps on allocation and preorder submits.
6. **B4 + B2 + B14** — privacy policy third parties and data inventory, allocation clauses in Terms.
7. **B5 + B12** — real data-request and account-deletion path.
8. **A20** — dependency scan and upgrades.
9. **C1 + C3 + C5 + C9 + A18 + A19 + A11** — Cloudflare configuration guide (headers, WAF, rate limiting, hotlink protection, monitoring) plus Auth rate-limit verification. Written instructions, no code.
10. **A2** — git history secret scan (instructions for you to run locally).

Approve to start at batch 1; each batch ships with its diff and no unrelated refactors.
