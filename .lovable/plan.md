## Fix the "Material is memory" swatch — make the image actually appear and the card visible

### What's broken

From the live preview at `/`:
- The swatch card area above "Material is memory" is empty — no image, no visible frame.
- Inspecting the network, the `/__l5e/assets-v1/.../material-memory-scarf.png` request never fires, even though the CDN serves it 200.
- The card div is in the DOM (so `bg-secondary` IS painting a faint tan rectangle), but because the homepage page background and `--secondary` are both off-white, the card edges are indistinguishable from the page and read as empty space.

Two issues compounding:
1. **Image never loads.** Both swatch `<img>` tags use `loading="lazy"`. The page uses a single inner `md:overflow-y-scroll` snap container, so `loading="lazy"`'s document-viewport intersection check never fires for sections that scroll into view inside that inner container.
2. **Card frame invisible.** `bg-secondary` (HSL 30 15% 90%) is too close to the off-white page background to register as a distinct swatch card. The reference image has clear contrast.

### Fix (frontend only, `src/pages/Index.tsx`)

1. Drop `loading="lazy"` on the swatch image so it loads on mount (the image is small enough and is the centerpiece of the section).
2. Remove the second (zoomed) crossfade `<img>` — with the actual photograph in place, the duplicated layer adds nothing and the hover zoom-in fights the editorial calm. Keep a single image with a gentle `scale-[1.02]` on hover instead.
3. Make the card frame visible:
   - Swap `bg-secondary` for an explicit warm-stone tone using a tailwind arbitrary value tied to the design system: `bg-[hsl(30_18%_88%)]` (slightly deeper than `--secondary` so the frame reads against the off-white page).
   - Add a hairline edge: `ring-1 ring-foreground/5`.
4. Make sure the photo fills the frame edge-to-edge: keep `object-cover object-center`, but tighten focus to the scarf using `object-[center_30%]` so the draped silk anchors the composition instead of the empty wall.
5. Eyebrow + caption stay where they are (top-right and bottom-center, inside the card) so it visually matches the reference. Adjust their color to read on the photo: `text-foreground/75` for the eyebrow and `text-foreground/60` for the caption, plus a soft top/bottom gradient scrim inside the card (`bg-gradient-to-b from-foreground/8 via-transparent to-foreground/10`) so the overlay text has the faintest separation without painting boxes.
6. No copy, layout, snap, easing, or section-order changes.

### Out of scope

- No changes to other sections, pages, or imagery.
- No new assets; the CDN-hosted scarf photo stays as the source.
- No changes to the admin editor or content keys.

### Verification

After the change, on `/` at 1303×890, snap to the Material is Memory stop:
- A clearly framed warm-stone card sits above the headline.
- The chair-scarf photo fills the card edge-to-edge.
- `MULBERRY SILK — Nº 04` reads top-right and `image crossfades to fabric macro on hover` reads bottom-center.
- Network panel shows a single 200 request to `/__l5e/assets-v1/.../material-memory-scarf.png` on initial render.
