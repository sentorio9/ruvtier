## Redesign "Material is Memory" section to match reference

Update the Material is Memory block on the homepage (`src/pages/Index.tsx`) so it reads like the reference: a tall fabric swatch card with eyebrow label top-right and a caption bottom-center, then the headline, supporting line, and CTA stacked below.

### Visual structure

```text
            ┌─────────────────────────────┐
            │              MULBERRY SILK — Nº 04 │   ← eyebrow, top-right
            │                             │
            │      (silk swatch image)    │   ← 3:4 card, neutral tan
            │                             │
            │   image crossfades to fabric macro on hover
            └─────────────────────────────┘

                   Material is memory          ← serif display headline
        Every piece begins with a fibre chosen years before it is worn.
                ─── DISCOVER ALL MATERIALS → ───
```

### Changes (frontend only, `src/pages/Index.tsx`)

1. Replace the current centered scarf PNG block with a swatch card:
   - Outer card: `max-w-[340px] md:max-w-[420px]`, `aspect-[3/4]`, soft tan background (use existing `bg-secondary` token).
   - Hover crossfade between two images: primary swatch (uploaded chair-scarf image, `src/assets/material-memory-scarf.png`) and a second "fabric macro" layer — for now reuse the same image as the secondary so the crossfade hooks are in place (real macro image can be swapped later in admin).
   - Top-right eyebrow inside card: `MULBERRY SILK — Nº 04` using `.type-eyebrow` with `tracking-luxury-wide`, absolutely positioned `top-6 right-6`.
   - Bottom-center caption inside card: small muted `.type-eyebrow` line "image crossfades to fabric macro on hover", absolutely positioned `bottom-6 left-0 right-0 text-center`.
   - Both texts wired through `Editable` (`home_material_memory` content key, new fields `swatch_eyebrow` and `swatch_caption`) with brand.ts fallbacks.

2. Below the card (already exists, just tighten):
   - Keep `Material is memory` headline (`.type-display`).
   - Add a supporting line: `Every piece begins with a fibre chosen years before it is worn.` via `Editable` field `body` with brand.ts fallback.
   - Keep the existing `DISCOVER ALL MATERIALS →` CTA (`luxury-button`).

3. Add the new copy constants to `src/content/brand.ts`:
   - `HOME_MATERIAL_MEMORY_SWATCH_EYEBROW = "MULBERRY SILK — Nº 04"`
   - `HOME_MATERIAL_MEMORY_SWATCH_CAPTION = "image crossfades to fabric macro on hover"`
   - `HOME_MATERIAL_MEMORY_BODY = "Every piece begins with a fibre chosen years before it is worn."`

### Out of scope

- No changes to `/materials` page, navigation, or other homepage sections.
- No new image assets uploaded; the second crossfade layer reuses the existing scarf image until a macro shot is added via the admin editor.
- No changes to snap behavior, easing, or button styling — reuses existing design tokens.

### Verification

At 1303×890 on `/`, scroll to the Material is Memory snap section: tan swatch card visible with eyebrow top-right and caption bottom-center, headline + body line + CTA all inside one 100svh snap stop. Hover triggers the (currently identical) crossfade smoothly using existing `cubic-bezier(0.22,0.61,0.36,1)` easing.
