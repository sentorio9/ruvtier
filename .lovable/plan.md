Swap the three image imports in `src/pages/Index.tsx` back to the original sketches while keeping the new card layout (cream chip frame, hairline border, roman numerals, italic captions, serif title + underlined EXPLORE).

## Changes

**`src/pages/Index.tsx`** — only the three import lines change:
- `knitwearImg`  → `@/assets/explore-knitwear.jpg`
- `lifestyleImg` → `@/assets/explore-lifestyle.jpg`
- `appointmentImg` → `@/assets/explore-appointment.png`

All markup, classes, numerals, captions, titles, and EXPLORE link styling stay exactly as they are now.

## Cleanup

Delete the now-unused generated assets:
- `src/assets/explore-knitwear-v2.png`
- `src/assets/explore-lifestyle-v2.png`
- `src/assets/explore-appointment-v2.png`

## Verification

Reload `/`, scroll to "In Your Keeping", confirm the three original sketches render inside the new card frames.
