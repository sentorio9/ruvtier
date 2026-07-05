
# Phase 3 — Admin panel upgrades

Build the operations surface on top of the schema created in Phase 2. Reuse the existing dark admin theme, no redesign. No public-site changes in this phase.

## 3.1 Variants editor (inside Product form)

New component `src/admin/components/VariantMatrix.tsx`, embedded into `AdminProductForm.tsx` below the existing fields.

- Reads `product_variants` for the current product.
- Header row lets admin add a size and a colour to the working matrix. Sizes and colours are stored per-product on `products.size_options` / `products.color_options` (already jsonb) so no new reference tables.
- Grid: rows = sizes, columns = colours. Each cell shows SKU, price, stock, status (`active` / `inactive` / `sold_out`) and an inline edit.
- "Generate variants" button creates one row per size × colour combination that doesn't already exist.
- SKU auto-suggest: `RUV-{first 3 letters of collection}-{first 3 letters of colour}-{size}`, uppercased. Duplicate check against `product_variants.sku` before save (surface friendly error, don't hit the unique-constraint 500).
- Stock is read-only here — all stock changes go through the Stock page so a `stock_movements` row is always written.
- Deletes are soft (status → `inactive`) unless the variant has never been used; hard delete guarded by confirm modal.

## 3.2 Stock page

New route `/123vhtg241s/stock` → `src/admin/pages/AdminStock.tsx`, added to `AdminLayout` nav with a `Boxes` icon.

- Table: variant · product · SKU · size · colour · stock · reserved · available · status.
- Filters: all / low stock (available ≤ threshold) / out of stock / by allocation / active.
- Row action "Adjust" opens a small drawer: quantity delta (+/−), movement_type dropdown (`stock_added`, `stock_removed`, `manual_adjustment`, `returned`, `damaged`, `correction`), reason, note.
- On submit: single RPC-style operation — read current stock, insert `stock_movements` row with previous/new, update `product_variants.stock_quantity`. Wrapped in a Postgres function `public.adjust_variant_stock(variant_id, change, type, reason, note)` (SECURITY DEFINER, restricted to editor/admin via `is_editor_or_admin`) so the two writes stay atomic and RLS-safe.
- "History" tab shows recent `stock_movements` with filter by variant.

## 3.3 Orders — extend list + detail

Update `src/admin/pages/AdminOrders.tsx`:
- Columns add `payment_status` and `fulfilment_status` badges.
- New route `/123vhtg241s/orders/:id` → `AdminOrderDetail.tsx` reading `orders` + joined `order_items` + `payment_events` for that order.
- Detail shows items, Stripe IDs (read-only), internal notes editor, fulfilment status dropdown, and a Refund button that is **disabled with tooltip "Stripe not configured"** until Phase 4 goes live.
- No manual total edits; any status change writes an `audit_logs` row.

## 3.4 Dashboard tiles

Update `src/admin/pages/AdminDashboard.tsx` to add tiles alongside existing ones:
- Total / active / draft products (existing).
- Low-stock variants (`available_quantity ≤ low_stock_threshold`).
- Out-of-stock variants (`available_quantity ≤ 0`).
- Pending allocation requests.
- Pending appointments.
- Recent 5 stock movements.
- Payment readiness status (already added in Phase 1, keep as-is; will flip to green in Phase 4).

## 3.5 Stripe readiness page

New route `/123vhtg241s/stripe-readiness` → `AdminStripeReadiness.tsx`, added to nav under Settings.

Runs a client-side checklist against DB + a small `stripe-config-status` edge function (created in Phase 4, so this page shows "endpoint not yet deployed" until then). Displayed as three sections:
- **Pass** — items already satisfied (orders table, order_items, payment_events, admin routes gated, no secret in frontend bundle).
- **Warn** — variants without SKU, variants without price, products without images, products with `availability = purchasable` but no variants.
- **Block** — `STRIPE_SECRET_KEY` missing, `STRIPE_WEBHOOK_SECRET` missing, `SITE_URL` missing, webhook function not deployed.

Report is read-only. No action buttons that could accidentally toggle live payments.

## 3.6 Routing + nav

`src/App.tsx` — register the new admin routes under the existing `AdminProtectedLayout`:
- `/123vhtg241s/stock`
- `/123vhtg241s/orders/:id`
- `/123vhtg241s/stripe-readiness`

`AdminLayout.tsx` nav — add `Stock` (between Products and Orders) and `Stripe Readiness` (between Maintenance and Logs). Keep icon strokes at 1.5 to match the current set.

## 3.7 Small schema addition

One tiny migration alongside this phase:
- `public.adjust_variant_stock(variant_id uuid, change_qty integer, movement_type text, reason text, note text)` — SECURITY DEFINER, `SET search_path = public`, checks `is_editor_or_admin(auth.uid())` and raises otherwise; inserts movement + updates variant in a single transaction.
- Revokes default `EXECUTE FROM public` and grants only to `authenticated`.

## Explicit non-goals for this phase

- No public site changes.
- No Stripe SDK code (that's Phase 4).
- No secret keys requested.
- No changes to preorder / allocation / appointment flows.
- No new nav icons that break the existing typographic system.

## Files touched (expected)

New:
- `src/admin/components/VariantMatrix.tsx`
- `src/admin/pages/AdminStock.tsx`
- `src/admin/pages/AdminOrderDetail.tsx`
- `src/admin/pages/AdminStripeReadiness.tsx`
- one migration for `adjust_variant_stock`.

Edited:
- `src/admin/pages/AdminProductForm.tsx`
- `src/admin/pages/AdminOrders.tsx`
- `src/admin/pages/AdminDashboard.tsx`
- `src/admin/components/AdminLayout.tsx`
- `src/App.tsx`

Reply "go" to build Phase 3. After it lands I'll surface Phase 4 (Stripe edge functions, scaffolded but inert) as the next plan.
