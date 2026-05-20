## Goal

Make the RUVTIER repo legible to outside designers and AI agents — without changing a single pixel of the live site. Pure documentation, centralised copy constants, and header comments. No dependency, route, behaviour, or visual changes.

## Deliverables

### 1. `DESIGN_SYSTEM.md` (new, repo root)

Single canonical brand reference. Sections in this order:

1. House overview — one paragraph, contemplative voice, materials-as-subjects.
2. Wordmark — `R U V T I E R`, Cormorant Garamond / Jost rules, casing, tracking, no figural logo.
3. Color — table of every CSS var in `src/index.css` (paper grounds · ink · semantic statuses) with HSL, hex, semantic name, usage.
4. Typography — Cormorant Garamond + Jost families, weights, the six `.type-*` classes with clamp ranges, plus the seven `--luxury-tracking-*` and six `--luxury-leading-*` tokens.
5. Shape, motion, shadow — `--radius: 0px`, easing `cubic-bezier(0.22, 0.61, 0.36, 1)`, durations 300 / 500 / 700 / 1100ms, the single allowed shadow.
6. Iconography — every inline SVG from `Navigation.tsx`, `LuxuryFooter.tsx`, `FullScreenMenu.tsx` listed by name with its JSX, stroke 0.6, currentColor.
7. Voice & copy rules — each rule with a real before/after pulled from the codebase.
8. Layout tokens — `--content-max`, `--text-max`, `--section-gap`, `--hero-gap`, `--heading-body-gap`, `--body-button-gap` with the responsive overrides at 1024px / 768px.

### 2. `src/content/brand.ts` (new)

One named-export module collecting every hard-coded marketing string currently in JSX (Supabase-backed content stays in Supabase). Each export is a `const` with a JSDoc noting where it appears. Coverage:

- Manifesto paragraphs from `TheHousePage.tsx` (the `PARAGRAPHS` array fallbacks).
- Hero headline + pre-order labels from `Index.tsx`.
- Women / Men card season, title, blurb, CTA strings.
- "Material is Memory" headline + CTA.
- "In Your Keeping" tile labels + captions.
- `materialDescriptions` map from `MaterialPage.tsx`.
- All Rituals of Care sections + paragraphs from `RitualsOfCarePage.tsx`.
- Every closing-italic line across pages (audited from `Stillness`, `TheHousePage`, `MaterialPage`, etc.).

Then update the source pages to import these constants — used as the fallback argument to `useSiteText(...)` (and as plain literals where no `useSiteText` exists). Strings are byte-for-byte identical to current JSX.

### 3. `src/content/fixtures.ts` (new)

Static array of 6–8 sample products with realistic RUVTIER names, EUR prices, house-voice descriptions, and `availability` values (`in_store` | `made_to_measure` | `by_allocation`). 1–2 with `preorder_enabled: true`. Top-of-file JSDoc explains these are for design-tool / agent consumption when Supabase is unreachable; not imported by the running app.

### 4. Page header comments — `src/pages/`

Add a `/** … */` block to each of: `Index.tsx`, `TheHousePage.tsx`, `ProductPage.tsx`, `MaterialPage.tsx`, `Materials.tsx`, `CollectionPage.tsx`, `PreorderPage.tsx`, `ContactPage.tsx`, `RitualsOfCarePage.tsx`. Each block states purpose, section order, design-system pieces it relies on.

### 5. Component header comments — `src/components/`

Add a `/** … */` block to: `Navigation.tsx`, `LuxuryFooter.tsx`, `FullScreenMenu.tsx`, `CartDrawer.tsx`, `ClientLoungeDrawer.tsx`, `SearchOverlay.tsx`, `SubscribePanel.tsx`, `ScrollFadeIn.tsx`. What it is, key props, what uses it, design-system classes it depends on.

### 6. `README.md` rewrite

Replace Lovable boilerplate with:
- One paragraph on what RUVTIER is.
- One-bullet tech stack (Vite · React · Tailwind · shadcn · Supabase).
- **For designers / AI agents** section linking to `DESIGN_SYSTEM.md`, `src/content/brand.ts`, `src/content/fixtures.ts`, `src/index.css`, `tailwind.config.ts`.
- Short "Running locally" section.

### 7. `src/index.css` annotation

Keep as source of truth for tokens. Add a top `/** … */` block describing file structure, and a one-line comment above each token group ("Paper grounds — warm cream canvas", "Ink — warm charcoal, never pure black", semantic statuses, luxury typography scale, layout tokens, responsive overrides). No token values changed.

## Out of scope

- `src/admin/**` and `src/editor/**` — untouched.
- No dependency changes, no route changes, no behaviour changes.
- No restyle, no refactor of existing component types.
- Supabase-backed copy stays in Supabase; `brand.ts` only mirrors current JSX fallbacks.

## Verification

- Diff the rendered output mentally per page: every string moved must equal the original.
- `bun run build` (auto by harness) must pass with no TS errors on the new files.
- Spot-check Index, The House, a Material page, Rituals of Care in the preview — no visual change.
