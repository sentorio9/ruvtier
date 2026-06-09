# Homepage flow rework

All work is in `src/pages/Index.tsx` (+ a small content addition in `src/content/brand.ts`). No backend, no design-system changes. Tokens, fonts and components stay exactly as they are.

## Final section order

1. Hero (reframed, shorter)
2. **NEW** Manifesto line
3. Featured Pre-Order (kept, unchanged)
4. Collections split — Women / Men (kept)
5. **NEW** The Edit — 4-up featured products
6. Material is Memory (rebuilt as asymmetric 2-column)
7. In Your Keeping (kept)
8. Footer

## Section-by-section

**1. Hero — shorter, lets the next section peek**
- Reduce min-height from `100svh` to `88svh` on desktop, keep `100svh` on mobile so the headline still breathes on small screens.
- All copy, image, CTA, utility caption, eyebrow stay identical.

**2. Manifesto (new)**
- Centered band between Hero and Featured Pre-Order, on `bg-background`, separated only by a `border-b border-border` hairline (the existing `--border` token = stone hairline).
- Serif italic line, max-width ~560px: *"We make few things, slowly — and only once."*
- Eyebrow underneath in `type-eyebrow`: `THE HOUSE OF RUVTIER · EST. PALERMO ITALY`
- Vertical padding: `py-[clamp(56px,9vh,112px)]`. Not snap-aligned (it's an interstitial, not a full panel).
- Strings added to `src/content/brand.ts` as `HOME_MANIFESTO_LINE` and `HOME_MANIFESTO_EYEBROW`, wired through `useSiteText("home_manifesto", ...)` so admins can edit later.

**3. Featured Pre-Order — unchanged** (kept per your answer).

**4. Collections split — unchanged.**

**5. The Edit (new)**
- Header row: left = eyebrow `THE EDIT` + serif `Six pieces, this season`; right = `VIEW ALL` link → `/collection`. Aligned to baseline, hairline below.
- 4-up grid on desktop (`grid-cols-4`), 2-up on mobile (`grid-cols-2`), gap `clamp(12px,2vw,24px)`.
- Source: `useActiveProducts({ featured: true, limit: 4 })` (same hook already imported). Section renders nothing if fewer than 1 product.
- Each card:
  - 3:4 image (`hero_image_url || thumbnail_url`), same hover treatment as the Featured Pre-Order card (slow scale + soft shadow).
  - Name in `type-title` size variant matching the small card scale.
  - Second line: `formatPrice(price) · Reserve` for `preorder_enabled` products → links to `/preorder/{slug}`. Otherwise `formatPrice(price) · Discover` → `/product/{slug}`. Whole card is the link; the dot-separated label appears in `type-eyebrow` stone.
- Lives on `bg-background` (no tinted band — keeps single-surface continuity already established for the footer).

**6. Material is Memory — rebuilt as asymmetric 2-column**
- Desktop: `grid md:grid-cols-[1.15fr_1fr] min-h-[78svh]`. Mobile: stacked, image on top, current padding scale.
- Left: full-bleed `materialMemoryScarf` image, `object-cover`, slow hover scale (existing ease curve, 900ms). No overlay text.
- Right: vertically centered copy block (`px-[clamp(28px,5vw,72px)]`):
  - Eyebrow: `THE MATERIAL LIBRARY`
  - `type-display` headline: existing `materialMemoryHeadline`
  - `type-body` paragraph: existing `materialMemoryBody`
  - Inline material list (Cashmere · Baby camel · Sea island cotton) in `type-eyebrow` stone, dot-separated
  - CTA: existing `materialMemoryCta` → `/materials`, as the current text-link with underline animation (not the boxed `luxury-button`, to match the rest of the page's text-only CTAs)
- All copy keeps its existing `useSiteText` keys; only layout changes. New material-list strings added to `brand.ts` as `HOME_MATERIAL_MEMORY_FIBRES` and wired via `useSiteText`.

**7. In Your Keeping — unchanged.**

## Snap behavior
Keep the existing desktop snap container. New Manifesto = interstitial (no `md:snap-start`, no `min-h-[100svh]`). The Edit and Material is Memory keep `md:snap-start` + `md:min-h-[100svh]` to stay on the film-strip cadence.

## Files touched
- `src/pages/Index.tsx` — section additions + reorder + Material rebuild
- `src/content/brand.ts` — 3 new copy constants (manifesto line, manifesto eyebrow, material fibres)

## Out of scope
No new images, no migrations, no admin-panel changes (existing `Editable` + `useSiteText` pattern is reused for every new string), no token/font/color edits, no component-library changes.
