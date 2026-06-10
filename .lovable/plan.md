
# Homepage Harmony Pass

Goal: keep every section, copy and component, but make the homepage feel like one calm, contained ivory document. No full-bleed images, one palette everywhere, consistent margins, gentle motion. Loro Piana restraint in RUVTIER's voice.

## 1. Unified palette (`src/index.css` + `tailwind.config.ts`)

Replace current `--background` / warm tokens so the whole site sits on one canvas:

- `--background` → `#F4F1EA` (canvas)
- `.bg-warm-1` / `.bg-warm-2` → both become `#EAE4D8` (single warm inset)
- `--border` → `#DDD8CE` (hairline)
- `--foreground` → `#3A3A3C`; `--muted-foreground` → `#6B665C`
- `--secondary` / image well → `#BDB3A1` family (taupe)
- Add `--accent-cool: #5B6770` (used only as rare image-well placeholder)

Remove all other public-site backgrounds. Search-and-remove any hard-coded `#1E1C18`, `#F7F5F0`, `#F2EEE6`, `#EFEBE3` background bands in homepage components and swap to tokens. Admin theme untouched.

## 2. Containment frame

`.luxury-container` updated to `max-w: 1280px; padding: 0 64px;` (tablet 32px, mobile 20px). Add a `.frame-x` utility = same horizontal padding for sections that need to extend background but keep content inset.

Remove every `full-bleed`, `min-h-[88svh]`, `min-h-[100svh]`, `min-h-[55vh]`, `min-h-[60vh]`, absolute-inset hero image pattern from the homepage. All images become contained block elements with the canvas visible around them.

## 3. Per-section rework (`src/pages/Index.tsx` + home components)

Keep order: Hero → Manifesto → Collections → The Edit → Material → The Making → The Icons → At Your Service → Allocation → In Your Keeping → Footer.

- **Hero** (`Index.tsx`): drop absolute fill. Become a contained block — image is `~60vh max-height` (`max-h:[60vh]`, `aspect-[16/9]` cap), inset inside `.luxury-container`. Headline + eyebrow + CTA move **below** the image, centred. Add slow Ken Burns: `animate-[kenburns_20s_ease-in-out_infinite_alternate]` keyframe `scale(1) → scale(1.04) translate(-1%,0)`. Overlay tint removed.
- **Manifesto** (`bg-warm-1`): unchanged copy; reduce padding to `section-pad-sm`, keep hairline above + below.
- **Collections**: keep grid; reduce container to `max-w:72%` removed → simply the standard container, two equal `aspect-[3/4]` contained images side-by-side with gap.
- **The Edit** (`bg-warm-2` → now single `#EAE4D8` warm inset): contained, hairline top/bottom. Cards already `aspect-[3/4]` — keep.
- **MaterialCenterpiece**: rebuild as contained 2-col grid (image left ~50%, text right ~50%) inside `.luxury-container`. Image becomes `aspect-[4/5]` capped at `max-h:520px`. Remove `min-h-[75vh]` and `overflow-hidden` full-bleed wrapper. Replace `HOME_MATERIAL_MEMORY_BODY` with the new copy: "Spun in our Palermo atelier from a single named fibre we trace to its source. We make only what it allows." Replace `HOME_MATERIAL_MEMORY_ORIGIN_TAG` with `"[INSERT REAL NAME] · Traceable"`.
- **TheMaking**: stop using a background image with dark overlay. Becomes a contained centred block: image ~55% width, `aspect-[4/3]`, caption (eyebrow + headline + body + CTA) **below** the image, centred. Remove `#1E1C18` overlay and dark surface. Sits on canvas.
- **TheIcons**: already contained; keep, just align margins.
- **AtYourService**: convert from charcoal full-bleed to warm inset (`bg-warm-1`, hairline top/bottom). Text-led 4-column on inset. Drop all `#1E1C18` / `#F7F5F0` / `#A8A39A` colours — use tokens (`text-foreground`, `text-muted-foreground`).
- **AllocationNote**: keep, warm inset, hairline top/bottom.
- **In Your Keeping**: keep contained grid; align padding to scale.

## 4. Section rhythm

Add to `src/index.css`:

```css
.section-pad-sm { padding-block: 40px; }
.section-pad-md { padding-block: 64px; }
.section-pad-lg { padding-block: 88px; }
.hairline-top    { border-top: 0.5px solid hsl(var(--border)); }
.hairline-bottom { border-bottom: 0.5px solid hsl(var(--border)); }
```

Mobile (≤768px) halves these.

Apply hairlines between contiguous same-tone sections so separation reads quietly. Warm-inset blocks (The Edit, At Your Service, Footer top band) provide the alternative separation; no charcoal bands.

## 5. Motion

In `src/index.css`:

```css
@keyframes kenburns { from{transform:scale(1)} to{transform:scale(1.04) translate(-1%,0)} }
@keyframes imgSettle { from{transform:scale(1.04); opacity:0} to{transform:scale(1); opacity:1} }
.motion-img-reveal { animation: imgSettle 1.2s cubic-bezier(0.22,0.61,0.36,1) both; }
.motion-kenburns   { animation: kenburns 20s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .motion-img-reveal, .motion-kenburns,
  [class*="animate-"] { animation: none !important; transition: none !important; transform: none !important; }
}
```

`ScrollFadeIn` updated to: fade + rise 16px over 800ms ease-out, threshold ~15%. Children stagger 100ms (parent passes `delay={i*0.1}` — already the pattern). Apply `motion-img-reveal` to images inside `whileInView` blocks via `onViewportEnter` (or simpler: add the class with `viewport.once` using a small `useInView` wrapper).

Links/CTAs: keep existing underline pattern but standardise to **wipe in from left** (origin-left scale-x-0 → scale-x-100, 300ms). Product cards already crossfade-on-hover + scale; tune to 600ms / 1.03.

## 6. Cleanup

- Remove leftover `snap-*`, `scroll-snap-*` classes from homepage and any home component.
- Remove all hard-coded hex backgrounds (`bg-[#1E1C18]`, `bg-[#F7F5F0]`, etc.) on the homepage; replace with tokens.
- Update `HOME_MATERIAL_MEMORY_BODY` and `HOME_MATERIAL_MEMORY_ORIGIN_TAG` in `src/content/brand.ts`.
- Delete or stop importing `src/assets/the-making-atelier.jpg` background usage; image can stay as the contained Making photo instead.

## Files touched

- `src/index.css` (tokens, hairlines, keyframes, container padding)
- `tailwind.config.ts` (re-expose `--accent-cool` if used as utility; otherwise none)
- `src/content/brand.ts` (Material copy + origin tag)
- `src/pages/Index.tsx` (Hero rework, remove dark/full-bleed wrappers, hairlines)
- `src/components/home/MaterialCenterpiece.tsx` (contained 50/50)
- `src/components/home/TheMaking.tsx` (contained, no overlay)
- `src/components/home/AtYourService.tsx` (warm inset, tokens)
- `src/components/home/AllocationNote.tsx`, `TheIcons.tsx` (token alignment only)
- `src/components/ScrollFadeIn.tsx` (800ms / 16px / threshold 0.15)

## Out of scope

- Fonts, layouts of admin, footer internals, router, product data, schema.
- No new colours beyond the listed palette.
- No copy changes except the Material body + origin tag.
