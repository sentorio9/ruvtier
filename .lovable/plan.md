# Final QA Pass — RUVTIER

Read-only verification sweep, followed by micro-polish only where a real issue is found. No new features, no redesign, no Shopify, no checkout.

## 1. Route sweep (Playwright, headless, 1280×1800 + 390×844)

Load and screenshot each route. Log console errors, 404s, broken images.

- `/`, `/the-collection`, `/the-house`, `/journal`, `/stillness`
- `/appointments`, `/made-to-measure`, `/contact`, `/faq`, `/find-boutique`
- Product pages: Theia Sweater + every product in `products` table
- Materials: each material route
- Boutique categories: every `/boutique/*` incl. all coming-soon
- Policies: `/privacy`, `/cookies`, `/terms`, `/returns`, `/refund`, `/shipping`

Checks per page: HTTP 200, no console errors, no `£0` / `$0`, no `[insert…]`
placeholders, no duplicate gallery thumbs, breadcrumbs render, images load.

## 2. Product page checks

- Query `products` in DB for any row with `price = 0`, null image, or duplicated image URLs — spot-fix in DB only if truly broken.
- Verify Theia Sweater renders "Available by allocation" (not £0).
- Click Request Allocation → drawer opens → submit test row → confirm row lands in `preorder_requests` and appears in Admin → Preorders.
- Confirm 4 accordions render (Material / Fit / Care / Provenance).
- Mobile screenshot of one product page.

## 3. Appointments flow

- Submit `/appointments` form with each `appointment_type`, a date, a time.
- Verify row in `appointment_requests`.
- Load `/123vhtg241s/appointments` as admin, confirm row visible, change status → confirm updated + audit log written.
- Screenshot success and validation-error states.

## 4. Allocation flow

- Submit Register Interest from a coming-soon category → confirm row in `preorder_requests` (single unified table, no duplicate system).
- Grep codebase for any second allocation table / endpoint to rule out duplication.

## 5. Nav / CTA / footer

- Click every primary nav item, footer link, and homepage CTA in Playwright — record any 404 / dead-end / weak landing.
- Verify active nav state on 3 sample routes.
- Open mobile menu, verify all links resolve.

## 6. Luxury polish review

Screenshot Coming-Soon, Made-to-Measure, The House, Journal, Stillness,
Contact, Appointments on desktop + mobile. Only flag/fix small issues
(spacing, orphan lines, empty sections, missing breadcrumb). No redesign.

## 7. Technical QA

- Console error scan across the sweep.
- `public/sitemap.xml`: confirm no admin routes (`/123vhtg241s/*`), no
  `lovable.app` / `lovableproject.com` URLs, canonical is `ruvtier.com`.
- `index.html`: title + meta description are RUVTIER-specific, no
  "Lovable Generated Project", canonical + og:url = `https://ruvtier.com`.
- `rg` for `[insert`, `lovable.app`, `lovableproject.com`, `gmail.com`,
  `TODO`, `FIXME`, `example.com` across `src/`, `public/`, policies.
- Confirm no secrets in client code (`SERVICE_ROLE`, hardcoded keys).
- RLS spot-check on `appointment_requests`, `preorder_requests` via
  `supabase--read_query`.
- Tablet (768) + mobile (390) screenshots of Home, Product, Appointments.

## 8. Micro-polish scope (allowed edits only)

If — and only if — the sweep surfaces one of these, fix in place:

- A placeholder string (`[insert…]`, `gmail.com`, `lovable.app` in metadata).
- A sitemap entry pointing at an admin route or removed page.
- A `£0` product rendered as a price instead of "Available by allocation".
- A duplicate image in a product gallery not caught by the dedupe.
- A missing breadcrumb on a route already using the pattern.
- A form that fails basic validation (empty submit passes).

Anything larger is reported, not fixed.

## 9. Final report delivered to user

Sections A–J exactly as requested: Routes tested · Issues fixed · Issues
remaining · Product pages · Appointments · Allocation · Mobile · Admin
panel · Sitemap & metadata · Publish recommendation. Ends with the
verbatim clearance line if everything passes:

> "RUVTIER is ready to publish as a public waitlist, preorder and appointment-only luxury website."

## Technical notes

- Playwright script under `/tmp/browser/qa/`, screenshots per route,
  console + network captured to file, grepped after.
- DB reads via `supabase--read_query`; any data fix via
  `supabase--migration` (only if a real broken row is found).
- No dependency installs, no route additions, no schema changes.
