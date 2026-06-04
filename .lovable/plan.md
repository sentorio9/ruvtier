## Use the uploaded scarf photo as the swatch image

The structure built last turn matches the reference (eyebrow top-right, caption bottom-center, headline + body + CTA below). The remaining gap is the actual imagery — the card currently shows the old PNG with transparent background on a tan fill. Swap in the new chair-scarf photo so it fills the swatch.

### Changes

1. Upload `user-uploads://image-49.png` (the navy-border silk scarf on the wooden chair) via `lovable-assets create` and write the pointer to `src/assets/material-memory-scarf.png.asset.json`.
2. In `src/pages/Index.tsx`:
   - Import the new asset pointer instead of `material-memory-scarf.png`.
   - Use it as the swatch image (`object-cover object-center`) so the photo fills the 3:4 card edge-to-edge.
   - Keep the hover layer using the same image with a `scale-[1.25]` zoom (acts as the "fabric macro" crossfade until a dedicated macro shot exists).
   - Keep the eyebrow `Mulberry Silk — Nº 04` (top-right) and the caption `image crossfades to fabric macro on hover` (bottom-center) — set their color to a soft dark tone that reads on the off-white scarf (`text-foreground/60`).
3. Leave the existing `src/assets/material-memory-scarf.png` binary untouched (other code may reference it); the new pointer JSON replaces only what `Index.tsx` imports.

### Out of scope

- No layout, headline, body, CTA, snap, or easing changes.
- No new editor fields; existing `Editable` wiring stays.
- No other pages touched.

### Verification

Reload `/`, scroll to the Material is Memory snap stop: the silk-scarf-on-chair photo now fills the swatch card; eyebrow and caption remain legible over the image; hover triggers a smooth zoomed crossfade.
