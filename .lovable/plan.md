# RUVTIER Launch Credibility Plan

Scope: fix everything flagged in the QA audit while keeping the current quiet-luxury visual language, the current navigation, and the current preorder/allocation model. No Shopify, no checkout, no invented facts.

## 1. Site-wide announcement banner
- New `LaunchStatusBanner` component mounted in `App.tsx` under `<Navigation />` via a small layout wrapper (or injected in `Navigation` itself to preserve sticky offsets).
- Copy: *"RUVTIER is currently available by private appointment and allocation request."*
- Styling: hairline top strip, `bg-background`, `text-foreground/70`, thin border-bottom, Jost, tracking-wide, small caps size, dismissible on mobile (session-scoped), never overlays hero.
- Adds top padding to `Navigation` so hero offset stays correct.

## 2. Coming-soon category pages (no empty routes)
- New shared `ComingSoonCategoryPage` component (replaces the generic `EditorialPage` usage for these routes).
- Applied in `App.tsx` for: `/boutique/lifestyle` (only if DB has no lifestyle products — otherwise keep gender listing), `/boutique/children`, `/boutique/footwear`, `/boutique/made-to-measure` (special, see §7), `/boutique/home-interiors`, `/boutique/leather-goods`, `/boutique/accessories`, `/boutique/textiles`, `/boutique/objects`, `/boutique/fragrance`, `/home-interior` (alias → redirects to `/boutique/home-interiors`).
- Layout: refined heading, one-line intent ("This world is being composed."), a secondary line ("Available soon by private allocation."), two CTAs: **Register Interest** (opens `AllocationRequestDrawer`, see §5) and **Book Appointment** (→ `/appointments`).
- Text-led when no imagery exists; uses existing sketch/asset images where available (e.g. `sketch-lifestyle`, `sketch-knitwear`).

## 3. The Collection page
- Sort products: available-first, then coming-soon, then by-allocation; stable secondary sort by `name`.
- Availability chip on each card: *Available by allocation · Coming soon · Request allocation · Private appointment*.
- Hide products with no image AND no price from the grid but keep route accessible; log a soft admin warning (dev-only console note).
- Filter tabs already exist — leave logic, tighten empty state copy per tab.

## 4. Product data + pricing (`formatPrice` + Theia + duplicates)
- `formatPrice` in `src/hooks/useProducts`: always integer rounding (no `.4` / `.51`), thin-space grouping, GBP default (`£`) with region override still respected. `0` → returns `null` sentinel so UI can render *Request Allocation* instead of `£0`/`$0`.
- Product card + product page: when price is null/zero OR `availability !== 'in_store'` and no firm price, show **Request Allocation** button in place of price.
- Theia Sweater: swap hero to best available real gallery image; if none, render the refined text-led hero variant (no beige rectangle). Force *Coming Soon* + *Request Allocation* until real price/image are set in admin.
- Waffle Cashmere Mock Bordeaux + Atelier Boiled Wool Shell: gallery de-dupes by URL; if only one unique image remains, render single-image gallery layout (no repeated thumbnails).

## 5. Product page template (Theia-style everywhere)
- Consolidate `ProductPage.tsx` to always render the accordion template with sections: **Material · Fit · Care · Provenance**. Empty/one-word DB values fall back to safe short copy (no invented certifications).
- Always show: title, short description, gallery, price OR *Request Allocation*, **Request Allocation** CTA, **Book Private Appointment** CTA, related products / return to Collection.
- Uses the existing preorder flow (`/preorder/:slug` + `preorder_requests` table) as the Request Allocation backend — no new table.
- Add breadcrumbs (Home / Boutique / [Category] / Product) on product + boutique pages.

## 6. Contact + policies
- Global replace of `[insert contact email]` in all `src/pages/*Policy*.tsx` + `TermsAndConditions.tsx` with `contact@ruvtier.com`.
- `ContactPage`: reorganised into four labelled channels — General enquiries (`contact@`), Client services (`clientservices@`), Private appointments (`appointments@`), Private client (`private@`). Keep existing phone, present in refined typographic block.

## 7. Appointments — real request flow
- New `appointment_requests` table via migration:
  - fields: `full_name`, `email`, `phone`, `appointment_type` (enum-ish text: private_consultation | made_to_measure | collection_viewing | client_services), `preferred_date` (date), `preferred_time` (text slot), `message`, `status` (pending | confirmed | completed | cancelled, default pending), `notes` (admin).
  - RLS: `anon` INSERT allowed (public form), `authenticated` admins SELECT/UPDATE via `has_role`. GRANTs per rules. `service_role` all.
- New `/appointments` page: refined form (Shadcn + zod). Preferred date via Shadcn Datepicker (with `pointer-events-auto`). Preferred time as a select of tasteful slots (10:00 / 12:00 / 14:00 / 16:00). Appointment type preselectable via `?type=made_to_measure` query param.
- Success + error states in-page (no toast-only). Also auto-syncs email to `customers` via trigger mirroring `sync_preorder_to_customer`.
- New admin page `/{ADMIN_PREFIX}/appointments` with list, detail drawer, status change. Registered in `App.tsx` and admin nav.

## 8. Client Lounge
- Add short explanatory copy in the drawer + on any lounge entry point: *"The Client Lounge is reserved for private allocation updates, appointment details and selected client communications."*
- Primary CTA: **Enter Client Lounge** (if session) / **Request Access** (if not) — Request Access reuses the private access drawer.

## 9. The House (founder page)
- Restructure `TheHousePage.tsx` into: intro · founder (**Rexford Joon Valenttier**) · Palermo atelier note · British + Italian influence · philosophy · quiet-luxury positioning · closing CTA (Book Appointment / Explore Collection).
- No dates, no awards, no press. Uses only existing imagery; text-led sections where none.

## 10. Made-to-Measure (`/boutique/made-to-measure`)
- Dedicated page (not the generic coming-soon): four refined steps — Consultation · Fabric selection · Measurements · Fittings — plus delivery timeline note and privacy note.
- CTA **Book a Made-to-Measure Appointment** → `/appointments?type=made_to_measure`.

## 11. Materials pages
- Expand `MaterialPage.tsx` template: intro · feel · use · care · product relevance · closing link back to Collection.
- Copy pulled from DB where present; otherwise safe generic paragraphs. No CITES / RWS / SFA / sustainability claims. Existing imagery only.

## 12. Journal + Stillness
- New route `/journal` with editorial hub: 3–5 cards, forthcoming ones clearly marked *Composed · Forthcoming*. Themes: Stillness and Craft · The Meaning of Allocation · The House of RUVTIER · Notes on Material · Private Appointment Culture.
- `/stillness` becomes a full editorial article (intro, 2–3 body sections, closing line), not a single quote. Link from Journal.

## 13. FAQ + Find Boutique
- `/faq`: proper accordion of ~10 questions covering private appointment, allocation, made-to-measure, availability, care, shipping, returns, client services.
- `/find-boutique`: reframed as *Private Appointments* — copy + CTAs to `/appointments` and `appointments@ruvtier.com`. No invented addresses.

## 14. Navigation, breadcrumbs, CTAs
- Keep nav items. Add active state via `NavLink`'s `isActive`.
- Add breadcrumbs component on product + boutique category pages.
- Audit and rewrite weak "Return" CTAs on secondary pages to actionable next steps (Request Allocation / Book Appointment / Join Waitlist / Contact Client Services / Explore The Collection).

## 15. Routing + sitemap
- Add `/journal`, `/{ADMIN_PREFIX}/appointments` routes. `/home-interior` becomes a `<Navigate>` alias to `/boutique/home-interiors`.
- Update `scripts/generate-sitemap.ts` (or `public/sitemap.xml`) to include all public routes, exclude admin routes and empty test pages.

## 16. Final QA pass
- Playwright script under `/tmp/browser/qa/` walks: home, each category, Theia + the two duplicate-gallery products, `/appointments` (submit form), `/faq`, `/find-boutique`, `/the-house`, `/journal`, `/stillness`, `/contact`, all policy pages. Captures screenshots and asserts: no `$0` / `£0`, no `[insert contact email]`, no broken image `alt`s, no duplicate gallery `src`s, mobile viewport render, no console errors.

## Technical section

**Files to add**
- `src/components/LaunchStatusBanner.tsx`
- `src/components/AllocationRequestDrawer.tsx` (thin wrapper around existing preorder flow)
- `src/components/Breadcrumbs.tsx`
- `src/pages/ComingSoonCategoryPage.tsx`
- `src/pages/AppointmentsPage.tsx` (replaces `/appointments` EditorialPage)
- `src/pages/MadeToMeasurePage.tsx`
- `src/pages/JournalPage.tsx`
- `src/admin/pages/AdminAppointments.tsx`

**Files to edit**
- `src/App.tsx` — new routes, banner mount, `/home-interior` alias, admin appointments route.
- `src/components/Navigation.tsx` — active state, banner offset.
- `src/components/LuxuryFooter.tsx` — Journal link.
- `src/hooks/useProducts.tsx` — `formatPrice` rounding + zero handling; product sort.
- `src/pages/ProductPage.tsx` — unified accordion template, gallery de-dupe, price/CTA logic, breadcrumbs.
- `src/pages/CollectionPage.tsx` — sort + availability chips + hide-broken.
- `src/pages/BoutiqueCategoryPage.tsx` — breadcrumbs + availability chips.
- `src/pages/TheHousePage.tsx`, `src/pages/Stillness.tsx`, `src/pages/MaterialPage.tsx`, `src/pages/ContactPage.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsAndConditions.tsx`, `src/pages/CookiePolicy.tsx`, `src/pages/ShippingPolicy.tsx`, `src/pages/ReturnsPolicy.tsx`, `src/pages/RefundPolicy.tsx`.
- `src/admin/components/AdminLayout.tsx` — Appointments nav entry.
- `scripts/generate-sitemap.ts` (or `public/sitemap.xml`).

**Migration**
- `appointment_requests` table + enum-ish check constraint + RLS (anon INSERT, admin SELECT/UPDATE via `has_role`) + GRANTs + `updated_at` trigger + optional customer-sync trigger.

**Data touch-ups (via `supabase--insert`)**
- Set Theia hero image (best real image) or `null` to trigger text-led fallback; set price to `null` until final; set availability to `by_allocation`.
- De-dupe `gallery_urls` array on the two flagged products.

**Non-goals (explicit)**
- No Shopify, no Stripe/Paddle checkout, no fake press, no fake certifications, no new imagery generation, no removal of current brand direction.

## Open questions before implementation
1. Confirm currency default: **GBP (£)** across the site, with region override kept? (audit implies UK.)
2. For Theia + any product without a real price, is it OK to hide the price entirely and show only *Request Allocation* until you set a real price in admin?
3. `/home-interior` — redirect to `/boutique/home-interiors` (my proposal) or the other way around?
4. Journal launch cards: publish as *Forthcoming* placeholders now, or wait until you provide the article copy?
