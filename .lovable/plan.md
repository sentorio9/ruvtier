## Goal

Swap the "Material is memory" image for the uploaded silk-scarf-on-chair photo, and align the fibres mentioned in that section with the materials actually listed on the site.

## Materials currently on site (`/materials`)
Vicuña · Cashmere · Merino Wool · Silk · French Linen · Denim

## Off-site fibres to remove from `src/content/brand.ts`
- `HOME_MATERIAL_MEMORY_FIBRES`: "Cashmere · Baby camel · Sea island cotton" → **"Cashmere · Silk · French Linen"** (all three exist on the materials page; matches the silk scarf imagery).
- `HOME_MATERIAL_MEMORY_SWATCH_EYEBROW`: "Mulberry Silk — Nº 04" → **"Silk — Nº 04"**.
- `HOME_MATERIAL_MEMORY_ORIGIN_TAG`: "[INSERT REAL NAME] · Traceable" → **"Palermo Atelier · Traceable"** (drops the placeholder).

## Image replacement
1. Upload the user's image via `lovable-assets create --file /mnt/user-uploads/image-56.png --filename material-memory-scarf.png` → write `src/assets/material-memory-scarf.png.asset.json` (overwrites the existing pointer that `MaterialCenterpiece.tsx` already imports — no component code change needed).
2. Delete the old CDN asset pointer's underlying file isn't necessary; overwriting the `.asset.json` with the new pointer is sufficient. The component will pick up the new URL automatically.

## Out of scope
- No layout, animation, palette, or component-structure changes.
- No edits to `/materials` page list itself.
- No changes to product data.
