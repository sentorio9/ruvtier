## Summary
Remove the placeholder annotation captions inside each "In Your Keeping" tile, eliminate the dark bottom band that holds them, and lighten the taupe mat/frame so the sketch fills its frame cleanly. Preserve the roman numerals, sketch images, below-frame captions, EXPLORE links, and hover effects.

## Changes

### `src/pages/Index.tsx` — In Your Keeping section (lines 372–418)

1. **Remove internal placeholder captions**
   - Drop the `caption` field from the three tile objects ("sketch — knitwear in hands", "sketch ⇄ photo on hover", "sketch — boutique façade").
   - Remove the hidden-md block `<span>` at `bottom-4` that renders `item.caption`.

2. **Remove the dark bottom band**
   - The caption band sits on top of the tile background. Removing the caption span eliminates the text; the visual "band" effect came from text legibility (often a subtle overlay or just contrast against the image edge). With the text gone, no extra strip is needed.
   - Change the tile container background from `bg-secondary` to `bg-background` so the frame reads as ivory, not taupe.

3. **Lighten the mat/frame**
   - Reduce image padding from `p-[8%]` to `p-[3%]` (or `p-2 md:p-3`) so the border is a refined hairline rather than a heavy placeholder card.
   - Keep `border border-border` for the hairline edge.

4. **Preserve everything else**
   - Keep the roman numeral (`item.numeral`) in top-left.
   - Keep the sketch image with existing hover scale.
   - Keep the below-frame label and EXPLORE link exactly as-is.