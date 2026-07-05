
# RUVTIER — Stripe Readiness Plan

This work prepares RUVTIER to eventually sell through Stripe. It does **not** turn on live checkout, does not touch Shopify, and does not put any secret keys in the browser. The public site continues to run as waitlist / preorder / allocation / appointment only until you explicitly approve going live.

The plan is split into six phases so you can approve step by step. I recommend approving Phase 1 first (audit + wording + safe DB scaffolding), then reviewing before I build the Stripe edge functions.

---

## Phase 1 — Remove Shopify wording, add "Payment readiness" framing

Text-only, no schema changes.

- `src/admin/pages/AdminOrders.tsx` notice: "Future Shopify integration" → "Future Stripe checkout integration. Preorder / allocation-only mode is active."
- `src/admin/pages/AdminCarts.tsx`: same treatment — clarify carts are not live commerce yet.
- Search the codebase for `shopify`, `Shopify`, `SHOPIFY` and replace user-facing copy with Stripe / payment-readiness equivalents. Keep any archived code comments only if removing would break context.
- `AdminDashboard`: add a "Payment readiness" tile showing `Stripe: not connected` until Phase 4 is wired.

## Phase 2 — Database: variants, stock movements, order items, payment events

Non-destructive migration. Existing `products`, `orders`, `preorder_requests`, `appointment_requests`, `customers`, `user_roles` stay as-is. New tables:

- `product_variants` — `id, product_id, title, sku (unique), barcode, size, colour, colour_hex, price, compare_at_price, currency, stock_quantity, reserved_quantity, low_stock_threshold, weight_grams, image_url, status, stripe_price_id, created_at, updated_at`. `available_quantity` as a generated column (`stock_quantity - reserved_quantity`).
- `stock_movements` — `id, variant_id, product_id, change_quantity, movement_type, reason, previous_quantity, new_quantity, note, created_by, created_at`. Enum: `stock_added, stock_removed, manual_adjustment, reserved, reservation_released, sold, returned, damaged, correction`.
- `order_items` — `id, order_id, product_id, variant_id, product_title, variant_title, sku, size, colour, quantity, unit_price, total_price, image_url, created_at`.
- `payment_events` — `id, stripe_event_id (unique), event_type, order_id, payment_intent_id, checkout_session_id, processed, processed_at, safe_payload jsonb, created_at`. Idempotency via unique `stripe_event_id`.
- Extend `orders` with: `payment_status, fulfilment_status, stripe_checkout_session_id, stripe_payment_intent_id, stripe_customer_id, payment_provider, subtotal, shipping_total, tax_total, currency` (nullable, backfilled).
- Extend `products` with `availability` enum: `purchasable, by_allocation, preorder, coming_soon, sold_out, archived`. Defaults existing rows to `by_allocation` so nothing accidentally becomes purchasable.

Every new public table gets: `GRANT` block, `ENABLE RLS`, and policies:
- `product_variants`: public `SELECT` where parent product is active; write restricted to admin/editor via `is_editor_or_admin(auth.uid())`.
- `stock_movements`, `order_items`, `payment_events`: admin-only.

`update_updated_at_column` triggers on the tables that need it.

## Phase 3 — Admin panel upgrades

Reuse existing dark admin theme. No new nav sections unless listed.

- **Products form** — add availability dropdown, fit / care / provenance / short_description / seo_title / seo_description fields if any are missing, hero image selector, alt text per image, drag-reorder for gallery.
- **Variants editor** (new component inside product edit page) — matrix of size × colour, per-cell SKU / price / stock / status. SKU auto-suggest `RUV-{category3}-{colour3}-{size}` with duplicate check.
- **Sizes & colours** — small managed lists (either as JSON on product or shared reference tables; I'll use per-product arrays first, shared tables only if you want reuse).
- **Stock page** (new route `/123vhtg241s/stock`) — list variants with filters (low stock, out of stock, by allocation), inline adjust with reason, writes a `stock_movements` row. No direct stock edits — all go through adjust action so history is preserved.
- **Orders** — extend list with payment status + fulfilment status columns, detail drawer showing items, Stripe IDs (read-only), internal notes, refund button (disabled until Phase 4 live).
- **Dashboard** — tiles: total/active/draft products, low-stock variants, out-of-stock, pending allocation requests, pending appointments, recent stock movements, Stripe status.
- **Stripe Readiness page** (new route `/123vhtg241s/stripe-readiness`) — runs the checklist in section 10 of your brief and shows pass / warn / block.

## Phase 4 — Server-side Stripe layer (scaffolded, not live)

Client code never imports Stripe secret. All secret work lives in edge functions.

Edge functions (created but return `503 not_configured` until secrets exist):
- `create-stripe-checkout` — validates cart server-side, re-reads prices/stock from DB, creates order in `pending_payment`, creates Stripe Checkout Session, returns session URL.
- `stripe-webhook` — verifies signature with `STRIPE_WEBHOOK_SECRET`, dedupes via `payment_events.stripe_event_id`, handles `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`, `charge.refunded`. Marks orders, writes `stock_movements`.
- `stripe-session-status` — safe read of a session status by ID.
- `stripe-refund` — admin-only, requires super_admin role check server-side.

Frontend service layer at `src/lib/payments/`:
- `types.ts`, `paymentConfig.ts`, `paymentStatus.ts`, `checkoutService.ts` (calls edge functions via `supabase.functions.invoke`), `refundService.ts` (admin only).
- No `stripeClient.ts` in the frontend bundle. The server-side Stripe SDK lives inside each edge function.

Secrets to request via `add_secret` when you approve going live: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`, `ADMIN_NOTIFICATION_EMAIL`. `STRIPE_PUBLISHABLE_KEY` only if we adopt Stripe.js Elements later — Checkout Session redirect doesn't need it. I will **not** request these in this plan; they come after your go-live decision.

Behaviour today: every function short-circuits with `{ error: "stripe_not_configured" }` when the secret is missing, so nothing accidentally attempts a live call.

## Phase 5 — Product availability logic on the public site

- `ProductPage` reads `products.availability` and renders the correct CTA: Add to Bag (purchasable, hidden until Stripe live), Request Allocation (by_allocation / coming_soon), Preorder (preorder), Sold Out, or nothing (archived).
- Until Stripe is live, `purchasable` items still show Request Allocation with a small "checkout coming soon" note so no half-working buy button ever appears.
- `formatPrice` continues rounding to luxury integers; `£0` fallback rule preserved.

## Phase 6 — QA + report

- Typecheck, build, Playwright sweep of key routes + admin flows.
- Verify no `shopify` strings remain in user-facing copy.
- Verify no Stripe secret is referenced from `src/`.
- Verify admin routes still absent from `sitemap.xml` and `robots.txt`.
- Produce the A–S final report from your brief, including a readiness score.

---

## Explicit non-goals

- No Shopify enable, no Shopify sync, no checkout going live.
- No secret keys added or requested in this plan.
- No destructive migrations. Existing rows preserved; new columns nullable with safe defaults.
- No redesign of the public site.

## Technical notes (for reference)

- Variant matrix uses a single `product_variants` table rather than separate `sizes` / `colours` tables — simpler for a single-brand catalogue and matches how Stripe Prices map 1:1 to variants.
- `stripe_price_id` on variant lets us later mirror the catalogue into Stripe without a second table.
- Idempotency: `payment_events.stripe_event_id UNIQUE` + insert-then-process pattern inside the webhook.
- Reservation model is scaffolded (`reserved_quantity`) but not enforced until you decide whether checkout should hold stock during the Stripe session.

## Suggested approval order

1. Phase 1 + 2 together (wording + schema).
2. Phase 3 (admin panel).
3. Phase 4 + 5 (Stripe scaffolding + availability logic) — still no live checkout.
4. Phase 6 (QA + report).
5. Separate future turn: request Stripe secrets and switch checkout on.

Reply "go" to start Phase 1 + 2, or tell me which phases to bundle differently.
