## Hero redesign — `/` (src/pages/Index.tsx)

Match the attached reference while keeping the existing hero photograph and motion language.

### Layout
- Keep the existing `<section>` background image (`heroImage` / `heroImageOverride`) and its 15% dark overlay. No image swap, no zoom changes.
- Replace the centered `hero-glow` content block with a **left-aligned column** anchored to the bottom-left of the hero:
  - container: `luxury-container` with padding, content placed via `flex flex-col justify-end items-start` and bottom padding `pb-[clamp(64px,12vh,140px)]`.
  - max width ~`max-w-[640px]` so the headline wraps to two lines like the reference.
- Remove the soft radial glow ellipse and the thin bottom vertical divider (they belong to the centered composition).

### Content (top → bottom, left column)
1. **Eyebrow** — `SPRING / SUMMER 2026` in `type-eyebrow`, `text-[#F6F4F1]/80`, `tracking-luxury-widest`, small caps sizing (`text-xs md:text-sm`). New Editable key `home_hero / eyebrow` with brand.ts fallback.
2. **Headline** — existing `heroHeadline` ("Permanence in garment form"), `type-display` serif, left-aligned, sizes preserved (`text-5xl md:text-7xl lg:text-[5.5rem]`), tracking eased to `tracking-[0.02em]` to match reference, `leading-[1.05]`.
3. **CTA** — single link `DISCOVER THE COLLECTION` → `/collection`, `type-cta`, with the existing underline-fade treatment (underline visible by default, retracts on hover — same pattern as current Women/Men links). Margin `mt-8 md:mt-10`.

### Utility caption (bottom-right)
- Absolutely positioned inside the hero section, `bottom-[clamp(64px,12vh,140px)] right-[clamp(24px,5vw,64px)]`.
- Text: `full-bleed film, slow pan ↻` in `type-eyebrow` / `text-xs`, `text-[#F6F4F1]/70`. Static, no interaction.

### Removals
- The two existing `Pre-Order for Women` / `Pre-Order for Men` links are removed from the hero. (They remain reachable via Navigation and the Split Collection section below — no routes change.)
- The `home_hero / preorder_women` and `home_hero / preorder_men` `useSiteText` calls + brand.ts constants stay defined (so Supabase overrides aren't orphaned); they're simply not rendered in the hero.

### Motion
- Keep `ScrollFadeIn` wrappers: one around the eyebrow+headline group, one (delay 0.2) around the CTA, one (delay 0.35) around the utility caption.
- Easing/duration unchanged.

### Copy additions to `src/content/brand.ts`
- `HOME_HERO_EYEBROW = "SPRING / SUMMER 2026"`
- `HOME_HERO_CTA = "Discover the Collection"`  (rendered uppercase via `type-cta`)
- `HOME_HERO_UTILITY = "full-bleed film, slow pan ↻"`

### Files touched
- `src/pages/Index.tsx` — hero section JSX only (lines ~90–174). No other sections changed.
- `src/content/brand.ts` — add three exports above.

### Out of scope
- All other sections (Featured Pre-Order, Split Collection, Material is Memory, In Your Keeping, Footer).
- Image asset, navigation, design tokens, routes, Supabase schema.
- Admin/editor surfaces.

### Verification
- Screenshot `/` at desktop (1303×890) and mobile to confirm left-aligned composition, no overflow, caption sits clear of edges, CTA underline animates on hover.
