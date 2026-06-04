I’ll rework “In Your Keeping” to match the reference and replace the three sketches.

## Layout (match reference exactly)

1. Three equal cards, soft cream chip background (`bg-secondary`) with a 1px hairline border (`border-border`), no rounded corners.
2. Inside each card, 3:4 framed sketch area with subtle interior padding so the drawing floats; sketches sit on transparent backgrounds so the cream card shows through.
3. Top-left of each card: a small roman numeral overlay — I, II, III — in `type-eyebrow`, muted foreground.
4. Bottom-center of each card: tiny italic caption in muted foreground:
   - “sketch — knitwear in hands”
   - “sketch ⇄ photo on hover”
   - “sketch — boutique façade”
5. Below the card (outside the chip): serif `type-title` label (“Knitwear” / “Life in RUVTIER” / “By Appointment Only”) centered, then a small underlined uppercase `EXPLORE` link with the existing hover underline animation.
6. Section keeps current snap, heading, container, fade-in.

## New sketch assets (transparent PNGs, ~90% same art style)

Regenerate three pencil-sketch illustrations matching the existing graphite/charcoal line-art aesthetic, no shading background, soft hatching, slightly looser lines — but on transparent backgrounds so they overlay the cream chip cleanly:

- `src/assets/explore-knitwear-v2.png` — close crop of hands knitting with chunky yarn (similar to current)
- `src/assets/explore-lifestyle-v2.png` — quiet figure in luxury knitwear (similar register to current men sketch)
- `src/assets/explore-appointment-v2.png` — boutique façade with awning and entrance (similar to current)

Upload each via `lovable-assets` and import the pointers in `Index.tsx`. Old jpg/png files will be removed after the swap is verified.

## Code changes (scope-limited)

- `src/pages/Index.tsx`: swap the three image imports for the new asset pointers; restructure the “In Your Keeping” card markup to add the cream chip frame, hairline border, top-left roman numeral, bottom caption, then external title + EXPLORE.
- No changes to copy constants, snap container, navigation, or other sections.

## Verification

- Capture preview at 1303×890, scroll to the section, screenshot, and confirm the three cards visually match the reference (cream chips, numerals, captions, sketches floating inside).