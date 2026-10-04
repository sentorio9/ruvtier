# RUVTIER — Master Audit v3 (Phase 1, delta against previous audit)

No code changed. The previous audit's batches 1–3 already shipped (storage split, grant restore, stock tiers, submission caps, robots, legal updates). This pass covers the new v3 items and re-verifies changed ones. Approving starts Phase 2 at batch 1.

## Checklist A — Code security

| Item | Status | Location | Fix |
|---|---|---|---|
| A1 No secrets in frontend | Pass | `client.ts` | Publishable key only |
| A2 Git history | Can't tell | repo history | Run `gitleaks detect` locally (Needs a human) |
| A3 Public key protected | Pass | all 27 tables RLS on | Anon reads are column-scoped |
| A4 RLS verified | Pass | `pg_policies` | Re-verified last batch |
| A5 Minimisation / unused fields | Can't tell | all public forms | Phase 2: map every form field to a consumer; drop orphans |
| A6–A10 | Pass | — | Unchanged |
| A11 Auth rate limits | Can't tell | Auth settings | Verify signup/reset limits |
| A12 Captcha | Fail | allocation, appointment, house visit forms | Needs Turnstile site key |
| A13–A15 | Pass | — | Unchanged |
| A16 Uploads | Partial | buckets have no size/MIME limit | Code-side 5 MB + image check exists; bucket limits = human |
| A17 Trimmed responses | Pass | `useProducts.tsx` | Whitelist columns |
| A18 Headers | Fail | `index.html` meta CSP enforced, not report-only; HSTS/XFO/COOP impossible via meta | Cloudflare Transform Rules; move CSP to header in report-only first |
| A19 HTTPS | Can't tell | Cloudflare | Confirm "Always Use HTTPS" + HSTS |
| A20 Dependencies | Pass | last scan clean | Re-run in Phase 2 |
| A21–A22 | Pass | Stripe functions | Phase 2: run tampered-total test and show result |

## Checklist B — Legal

| Item | Status | Location | Fix |
|---|---|---|---|
| B1 Policy in every language | Fail | `PrivacyPolicy.tsx` English only; site offers multiple languages incl. Arabic | Translate or state English-only governs |
| B2–B3 | Pass | — | Done last batch |
| B4 Third parties + SDK audit | Partial | Google Fonts not named | Add Google Fonts or self-host fonts (self-host preferred) |
| B5 Deletion implemented | Fail | no deletion code | Edge function + "Delete account" in Client Lounge |
| B6 Public exposure | Pass | buckets split | Re-test logged-out URLs in Phase 2 |
| B7 Truthful scarcity/reviews | Pass | no review schema found | — |
| B8 Unsupported claims | Can't tell | copy site-wide | Phase 2 copy sweep, report list |
| B9 Dark patterns | Pass | no pre-ticked boxes found | — |
| B10 All-in pricing | Can't tell | checkout not live | Verify VAT/shipping shown before checkout on launch |
| B11 Refunds/14-day | Pass | `ReturnsPolicy.tsx` | Link from cart when live |
| B12–B14 | N/A | no subscriptions or chatbot | — |
| B15 Form consents | Fail | subscribe/preorder/appointment | Add "why" line + separate unticked marketing opt-in with timestamp column |
| B16 Cookie policy | Partial | `CookiePolicy.tsx` | List each cookie/storage key with purpose + duration |
| B17 GDPR contact | Can't tell | policy inbox | Send test email (human) |
| B18 Marketing email | Partial | newsletter | Ensure unsubscribe link + business address in marketing mail |
| B19 Children | N/A | adult luxury retail | One-line confirmation in policy |
| B20 Asset licences | Fail | `src/assets`, AI-generated imagery, fonts | Produce asset manifest; flag unknowns |
| B21 Terms | Pass | updated last batch | — |
| B22 Business identity | Fail | footer has no statutory line | Insert `[NEEDS-REAL-VALUE: registered name, company number, registered office]` |
| B24 Accessibility | Can't tell | site-wide | Keyboard + alt sweep; contrast flagged only |

## Checklist C — Scrapers

| Item | Status | Fix |
|---|---|---|
| C1, C3, C9 | Not configured | Cloudflare guide (human) |
| C2, C4, C7, C8 | Pass | Done last batch |
| C5 Imagery | Partial | Downsized renditions + hotlink protection |
| C6 Captcha drop | Fail | Turnstile key needed; caps already in place |

## Checklist D — SEO

| Item | Status | Fix |
|---|---|---|
| D1 Per-language URLs/hreflang | Fail | Languages switch client-side at one URL; flag, design decision needed |
| D2 Structured data | Can't tell | Verify Organization/Product schema matches real details |
| D3 Unique titles | Partial | English unique; other languages not |
| D4 Sitemap/canonicals | Partial | Sitemap ok; verify absolute self-canonicals |
| D5 Image weight | Can't tell | Report heaviest pages |
| D6 Facts consistent | Can't tell | Needs real address/hours |

## Ranked fix order (batches of 2–3)

1. B22 + B15 — statutory footer tokens; consent copy and separate opt-in (copy only, design lock kept).
2. B5 + B17 — account deletion path.
3. B4 + B16 + B1 — self-host fonts, cookie table, language statement.
4. A18 — CSP report-only header plan; keep meta until clean.
5. A5 + A22 — form field mapping; tampered-total test.
6. B20 + B8 + B24 — asset manifest, claims sweep, accessibility sweep (reports).
7. D2–D5 — SEO checks.
8. A12/C6 — Turnstile once key provided.

## Needs a human

- Turnstile site + secret key (Cloudflare > Turnstile > Add site).
- Bucket limits: 5 MB + image MIME on public image buckets (backend storage settings).
- Cloudflare: WAF managed rules, Bot Fight Mode, rate rule on `/rest/v1/*`, Always HTTPS + HSTS, Transform Rules for security headers, hotlink protection.
- Auth rate limits check in backend settings.
- `gitleaks detect` on a local clone.
- Real legal identity, GDPR contact inbox (with test email), and multilingual policy decision.
