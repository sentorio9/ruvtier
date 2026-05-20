Implement the selected "Stacked editorial group" hero in `src/pages/Index.tsx`.

## Changes (hero section only)

1. **Headline becomes a clickable serif statement linking to `/collection`** (Spring/Summer 2026).
   - Wrap in `<Link to="/collection">` with `aria-label="Discover the Spring/Summer 2026 collection"`.
   - Promote element from `<p>` to `<h1>` for SEO and semantic weight.
   - Larger scale on desktop: `text-5xl md:text-7xl lg:text-[5.5rem]`, leading `1.15`, tracking `0.08em`, color `#F6F4F1`.
   - Hover: whole link micro-scales `1.01` (700ms, brand easing); a thin chevron-down icon (0.6 stroke, brand spec) fades in beneath the headline as the clickability hint.
   - Editable wrapper preserved so admin editor still works.

2. **Pre-Order pair (Women / Men) — restyled as Loro Piana paired CTAs.**
   - Move them up into the same centered composition group (no longer absolutely anchored at the bottom).
   - At rest: white text + thin always-visible underline at 60% opacity (matches the chosen direction).
   - Hover: underline scales `scale-x-0` from left, revealing emphasis (700ms, brand easing).
   - Color shifts from current `text-foreground` (dark grey) to `text-[#F6F4F1]` so they remain legible on the dark editorial hero image.
   - Spacing: `gap-8 md:gap-16`, `mt-10 md:mt-14` below the headline group.

3. **Vertical anchor line** at the bottom-center (1px × 48px, 25% opacity off-white) — a quiet visual cue that more content follows.

4. **Remove** the redundant secondary halo behind the old bottom-anchored CTAs (no longer needed since CTAs are now grouped with the headline under the existing central halo).

## What stays the same

- Hero image, `Editable` content keys (`home_hero / headline / preorder_women / preorder_men`), the central radial halo, ScrollFadeIn entrances, snap-section structure.
- Brand tokens: Cormorant Garamond serif, Jost uppercase tracked, easing `cubic-bezier(0.22,0.61,0.36,1)`.

## Files touched

- `src/pages/Index.tsx` only (hero section block, roughly lines 84–133).
