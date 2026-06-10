
# Homepage rework — continuous editorial sequence

All work in `src/pages/Index.tsx` + `src/content/brand.ts` + four new presentational components + one generated image asset + small additions to `src/index.css`. No schema changes, no design-system rewrite, footer untouched, hover/crossfade interactions preserved.

## 1. Global rhythm (foundation — do first)

In `src/pages/Index.tsx`:
- Remove the snap container. Drop `md:h-[100svh] md:overflow-y-scroll md:snap-y md:snap-proximity motion-safe:md:scroll-smooth` from the root and every `md:snap-start` / `md:min-h-[100svh]` on inner sections.
- Keep `min-h-[88svh]` on the hero only (mobile keeps `100svh`). All other sections become content-driven with explicit padding tokens.

In `src/index.css`, add three spacing utility classes alongside existing tokens (no token rename, no token removal):
```css
.section-pad-sm { padding-block: clamp(40px, 6vh, 56px); }
.section-pad-md { padding-block: clamp(64px, 9vh, 88px); }
.section-pad-lg { padding-block: clamp(80px, 12vh, 112px); }
```
Add the band background tokens (used only on the homepage, kept off `:root` to avoid leaking):
```css
.bg-warm-1 { background:#F2EEE6; }
.bg-warm-2 { background:#EFEBE3; }
```
Charcoal already exists via `text-foreground` inversion patterns; for the dark service band use inline `bg-[#1E1C18]` (matches the existing pattern used elsewhere — no new token needed).

Section bands & widths, top → bottom:

| # | Section | Band | Width |
|---|---|---|---|
| 1 | Hero | image | full-bleed, 88vh |
| 2 | Manifesto | `bg-warm-1` | contained, pad-sm |
| 3 | Collections (Women/Men) | ivory | contained, pad-md |
| 4 | The Edit | `bg-warm-2` | contained, pad-md |
| 5 | Material is Memory | full-bleed image / ivory text | full-bleed, content-driven |
| 6 | The Making *(new)* | dark image | full-bleed, ~55vh |
| 7 | The Icons *(new)* | ivory | contained, pad-md |
| 8 | At Your Service *(new)* | `#1E1C18` | full-bleed band, contained content, pad-md |
| 9 | Allocation Note *(new)* | `bg-warm-1` | contained, pad-sm |
| 10 | In Your Keeping | ivory | contained, pad-md, hairline above |
| 11 | Footer | (existing LuxuryFooter, untouched) | — |

Hairline dividers (`border-t border-border`) only where two same-coloured sections meet (e.g. Collections → ivory neighbours, In Your Keeping → footer transition).

Featured Pre-Order block is removed from the homepage as per the new sequence. Its data still drives The Edit's "Reserve" CTA and the product page is unaffected.

## 2. New sections

### Manifesto (replaces existing manifesto block)
Already exists; just re-skin onto `bg-warm-1` + `section-pad-sm`, drop the `border-b` (band tone alone separates it). Copy unchanged ("We make few things, slowly — and only once." + "THE HOUSE OF RUVTIER · ATELIER PALERMO"). Add `HOME_MANIFESTO_EYEBROW` update in `brand.ts` to "The House of Ruvtier · Atelier Palermo".

### The Edit
Reuses existing block — only changes: wrap in `bg-warm-2 section-pad-md`, round prices to whole figures by adding a `formatPriceWhole(price)` local helper (formats with `maximumFractionDigits: 0`) used only here and in The Icons. Existing 4-up grid, eyebrow + serif + VIEW ALL header, Reserve/Discover CTAs retained.

### Material is Memory — rebuilt as full-bleed centerpiece (`src/components/home/MaterialCenterpiece.tsx`)
- Full-bleed grid: `grid-cols-1 md:grid-cols-[55fr_45fr]`. No `luxury-container` wrap — image truly touches the left page edge.
- Left 55%: `aspect-[4/5]` (image height drives section ~75vh on wide desktop). Crossfades through 2–3 fabric macros on a 6s loop using existing `materialMemoryScarf` as fallback frame 0; frames 1 and 2 are placeholder slots wired via `useSiteImage("site_image_home_material_macro_2")` and `…_3`. If a slot is empty, the cycle skips it.
- Small origin tag bottom-left of image: type-eyebrow, ivory chip with hairline, text `[FIBRE NAME]® · TRACEABLE`. Stored as `HOME_MATERIAL_MEMORY_ORIGIN_TAG` in `brand.ts` and wired through `useSiteText("home_material_memory","origin_tag", …)` so the user can plug in the real fibre name later without code edits.
- Right 45%: vertically centred, `px-[clamp(28px,5vw,72px)]`, ivory ground. Eyebrow "THE MATERIAL LIBRARY", serif "Material is memory", new body line: *"Spun in Palermo from a single named fibre we trace to its source. We make only what it allows."* (`HOME_MATERIAL_MEMORY_BODY` updated; old copy kept as the `useSiteText` fallback only — no DB write triggered automatically, so existing admin overrides win), fibre list line, then `DISCOVER ALL MATERIALS →` link (existing pattern).

### The Making — new component `src/components/home/TheMaking.tsx`
- Full-bleed `relative` section, `min-h-[55vh] md:min-h-[60vh]`.
- Background image: generated with `imagegen--generate_image` (model `standard`, 1920×1080, target `src/assets/the-making-atelier.jpg`). Prompt: *"Editorial medium-format photograph of a craftsperson's hands working folded woolen cloth on a worn wooden atelier bench, warm tungsten light from the right, deep shadows, no face visible, no logos, no text, soft natural film grain, desaturated warm tones — ivory, taupe, deep brown, single muted ochre accent, off-centre composition with negative space at upper left for text overlay."*
- Dark image overlay `bg-[#1E1C18]/45` for legibility.
- Centred text overlay (white): eyebrow `THE MAKING`, serif `Forty-one hours, one pair of hands`, body line `"Each piece is cut, canvassed and finished in our Palermo atelier by a single maker, whose initials it carries."`, optional `OUR CRAFT →` link to `/the-house`.
- Copy added to `brand.ts` as `HOME_MAKING_*`, all wired through `useSiteText("home_making", …)`. Image overridable via `useSiteImage("site_image_home_making")`.

### The Icons — new component `src/components/home/TheIcons.tsx`
- Contained, ivory, `section-pad-md`. Header row mirrors The Edit: eyebrow `THE ICONS` + serif `The pieces we are known for`; right side `VIEW ALL →` → `/collection`.
- 3-up grid (`grid-cols-1 md:grid-cols-3`), larger imagery (`aspect-[3/4]`, no internal padding — fills card), same hover scale + crossfade pattern as Edit cards. Per-card line: name + `€{whole price} · Reserve|Discover`.
- Data: reuse `useActiveProducts({ featured: true, limit: 12 })` from the existing hook call; pass the same dataset down. Pick the next 3 featured products **after** the 4 already shown in The Edit (filter by id). If fewer than 3 remain, the section renders nothing. (No schema change; no `is_icon` flag.)

### At Your Service — new component `src/components/home/AtYourService.tsx`
- Full-bleed dark band: `bg-[#1E1C18] text-[#F7F5F0] section-pad-md`.
- Inside: `luxury-container`, serif centred heading "At your service" (`type-display` on inverted colour — override via `text-[#F7F5F0]` and tweak `.type-display` colour locally with a wrapper class, not by editing the token).
- Below: `grid grid-cols-2 md:grid-cols-4 gap-[clamp(20px,3vw,40px)]`. Four items, each: serif title + one line stone-toned (`text-[#A8A39A]`) sub. Underline-on-hover via existing `.type-cta`/animated-underline pattern.
  1. Private appointment → `/contact` — "In store in Palermo, or by video"
  2. Concierge → `/contact` — "Monday–Sunday · 9–19h"
  3. Care & repair → `/rituals-of-care` — "For the life of the piece"
  4. The gift → `/contact` — "Wrapped by hand"
- All copy in `brand.ts` as `HOME_SERVICES`, wired through `useSiteText`.

### Allocation Note — new component `src/components/home/AllocationNote.tsx`
- `bg-warm-1 section-pad-sm`, centred, max-width 640px.
- Serif "What allocation means" + two-sentence body: "Each edition is made once. Clients are offered pieces in order of registration — no restocks, no waitlists." Optional `JOIN THE PRIVATE LIST →` link that opens the existing `SubscribePanel` (reuses `setSubscribeOpen(true)`).
- Copy in `brand.ts` as `HOME_ALLOCATION_*`, wired via `useSiteText("home_allocation", …)`.

## 3. Motion

`ScrollFadeIn` already implements fade-up-16px / 900ms / once / `prefers-reduced-motion`-aware behaviour via Framer Motion. Reuse it on every new block; stagger children with `delay={i*0.08}` for product grids and the service columns. No new motion primitive.

## 4. Files touched

- `src/pages/Index.tsx` — remove snap, reorder sections, drop Featured Pre-Order block, mount new components.
- `src/index.css` — add `.section-pad-sm/md/lg`, `.bg-warm-1`, `.bg-warm-2` utilities.
- `src/content/brand.ts` — add `HOME_MAKING_*`, `HOME_SERVICES`, `HOME_ALLOCATION_*`, `HOME_MATERIAL_MEMORY_ORIGIN_TAG`; update `HOME_MATERIAL_MEMORY_BODY` (fallback only) and `HOME_MANIFESTO_EYEBROW`.
- `src/components/home/MaterialCenterpiece.tsx` — new.
- `src/components/home/TheMaking.tsx` — new.
- `src/components/home/TheIcons.tsx` — new.
- `src/components/home/AtYourService.tsx` — new.
- `src/components/home/AllocationNote.tsx` — new.
- `src/assets/the-making-atelier.jpg` — new generated image (1920×1080, standard tier).

## 5. Verification

- Visual at 1440px and 1920px via the browser tool: confirm full-bleed sections truly touch edges, contained sections sit at 1280px max with 48px gutters, alternating bands read as grouped, no section padded to fill a viewport.
- Confirm mobile (390px): every grid stacks, padding halves naturally through the `clamp()` tokens, dark service band wraps to 2×2 grid.
- `prefers-reduced-motion`: ScrollFadeIn already disables motion via Framer — no extra work.

## Out of scope

No schema migrations, no admin-panel changes (admins can edit every new string through the existing `Editable` + `useSiteText` pattern), no font/palette changes beyond the two warm band tones, no footer changes, no router changes, no product-data logic changes.
