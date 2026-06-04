## Refine the "Material is Memory" section

Keep the existing centered single-column structure; only refine content, typography, and add hover crossfade + eyebrow + tag + supporting copy.

### 1. Generate hover-state macro image
Use the agent's `generate_image` tool (premium tier, 3:4) and save to `src/assets/material-memory-macro.jpg`:

> Extreme macro close-up of ivory silk satin weave, navy selvedge edge visible along the right side, raking soft side-light from left, fine threads catching highlights, desaturated warm filmic grade, shallow depth of field, no text or logos, editorial product photography, 3:4 portrait.

### 2. Copy updates — `src/content/brand.ts`
```diff
- export const HOME_MATERIAL_MEMORY_HEADLINE = "Material is Memory";
- export const HOME_MATERIAL_MEMORY_CTA = "Discover all material";
+ export const HOME_MATERIAL_MEMORY_HEADLINE = "Material is memory";
+ export const HOME_MATERIAL_MEMORY_CTA = "Discover all materials →";
+ export const HOME_MATERIAL_MEMORY_EYEBROW = "The Material Library";
+ export const HOME_MATERIAL_MEMORY_TAG = "Mulberry Silk — Nº 04";
+ export const HOME_MATERIAL_MEMORY_BLURB = "Every piece begins with a fibre chosen years before it is worn.";
```

### 3. Section rewrite — `src/pages/Index.tsx` (lines 315–355)

Import the macro image and the new brand strings, register `useSiteText` for eyebrow/tag/blurb. Then replace the section body with:

- **Eyebrow** (centered, `type-eyebrow tracking-luxury-wide text-[10px] text-muted-foreground`, mb-7 ≈ 28px) — Editable, `field="eyebrow"`.
- **Image frame** — `relative w-full max-w-[320px] md:max-w-[400px] mx-auto aspect-[3/4] overflow-hidden`:
  - Two stacked `<img>` (primary scarf + secondary macro) `absolute inset-0 w-full h-full object-cover`, secondary `opacity-0`, both transition opacity 600ms on group hover (primary → 0, secondary → 1). Both `loading="lazy"`.
  - Top-right tag `absolute top-3 right-3 type-eyebrow text-[9px] tracking-[0.2em] text-muted-foreground/80` — Editable, `field="tag"`.
- **Headline** — `relative z-10 -mt-[0.5em] type-display text-[30px] md:text-[42px]` (negative margin lifts it over the image).
- **Blurb** — `mt-5 max-w-[420px] text-[13px] leading-relaxed text-muted-foreground` — Editable, `field="blurb"`.
- **Link** — text-only CTA with left-anchored underline sweep, matches the pattern used by the Women/Men panels (`scale-x-0 group-hover:scale-x-100 origin-left`), `tracking-[0.2em]`. Removes the `luxury-button` chrome (per memory: buttons are text-only, no background boxes).
- **Reveal**: wrap the five elements in `ScrollFadeIn` with stagger delays `0`, `0.12`, `0.24`, `0.36`, `0.48` (≈120ms gap), each translating up 20px, 800ms duration. The existing `ScrollFadeIn` already drives this — pass `delay` per element.
- **Mobile**: image already adapts via `max-w-[320px]` then 24px gutters from `luxury-container`; headline shifts to `30px`.

### Out of scope
Other sections, header/footer, snap container, DB, copy outside `home_material_memory` keys.

### Verification
At 1303×890 land on the Material section: eyebrow → image (with corner tag) → headline overlapping image bottom → blurb → CTA, all stagger-fading in. Hover the image: 600ms crossfade to the silk macro, no jump. CTA underline sweeps from left. Mobile (375): image fills width minus gutters, headline 30px, overlap intact.
