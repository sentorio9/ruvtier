## Issues observed

1. **Women/Men captions invisible.** Inside the snap-section, each card uses `flex-1 min-h-0` for the image and a static caption below. Because the parent grid cell has no bounded height, the image renders at its intrinsic cover size and pushes the caption past the viewport.
2. **"Material is Memory" image is clipped.** The wrapper uses `max-h-[55svh] overflow-hidden` while the `<img>` has `w-full h-full object-contain` without an aspect-ratio container, so the image lays out at its natural portrait height and then `overflow-hidden` crops the bottom half.
3. **Loro Piana hover missing.** Screenshots 37/38 show: at rest, product image + caption below; on hover, the image **cross-fades to a second (lifestyle) image** and the caption **lifts upward onto a white panel that overlays the bottom of the image**. Currently we only do a scale/brightness micro-shift.

## Fix plan

### Issue 1 — Women/Men captions always visible

Lock the section to a true viewport height and reserve fixed space for the caption.

```text
section: h-[100svh] md:snap-start flex flex-col justify-center
  inner grid: h-full max-h-[calc(100svh-96px)] grid-cols-1 md:grid-cols-2
    card Link: group relative flex flex-col h-full
      image frame: relative flex-1 min-h-0 overflow-hidden
        img: absolute inset-0 w-full h-full object-cover
      caption: shrink-0 h-[110px] md:h-[120px] flex flex-col justify-start pt-5
```

This guarantees the caption block is always visible (fixed-height footer of the card) and the image fills the remaining space without overflow.

### Issue 2 — "Material is Memory" scarf no longer cropped

Replace the broken `max-h + overflow-hidden + h-full` combo with an aspect-ratio container so `object-contain` works correctly.

```text
wrapper: w-full max-w-[360px] md:max-w-[440px] mx-auto aspect-[3/4] max-h-[50svh]
  img: w-full h-full object-contain
```

No `overflow-hidden`. The scarf shows in full inside an honest 3:4 frame, capped by `max-h-[50svh]` so headline + CTA stay visible inside the same snap chapter.

### Issue 3 — Loro Piana hover (image swap + caption lift)

Reference behaviour from screenshots 37/38:
- Rest: primary image, caption sits below in normal page flow.
- Hover: secondary image cross-fades over primary; caption rises ~64px and sits on a soft off-white panel overlapping the bottom edge of the image.

Implementation on Women/Men cards (and reusable for "In Your Keeping"):

```text
card: group relative flex flex-col h-full
  image frame: relative flex-1 min-h-0 overflow-hidden
    img primary:   absolute inset-0 w-full h-full object-cover
                   transition-opacity 900ms group-hover:opacity-0
    img secondary: absolute inset-0 w-full h-full object-cover
                   opacity-0 group-hover:opacity-100 group-hover:scale-[1.02]
                   transition-[opacity,transform] 1100ms ease-luxury
  caption panel: relative shrink-0 bg-background z-10 px-6 pt-5 pb-6
                 transition-transform 700ms ease-luxury
                 motion-safe:group-hover:-translate-y-[56px] md:group-hover:-translate-y-[64px]
                 (Inner text gets a matching motion-safe:group-hover:opacity slight emphasis)
```

Easing: `cubic-bezier(0.22,0.61,0.36,1)` per Motion Principles. Disabled under `motion-reduce`.

For "In Your Keeping" tiles, apply the same lift (smaller offset, ~40px) but no image swap until alternate images are provided — keep current scale/veil micro-shift.

### Hover image source

We do not yet have alternate (lifestyle) photos for Women and Men cards. Two choices:

- **A. Reuse the homepage hero image as the hover image for Women and a featured-pre-order/lifestyle image for Men** — works today, no asset upload needed, the swap reads as a mood shift.
- **B. Wait for the user to supply two new "hover" images** (e.g. close-up garment detail or model lifestyle shots) and wire them in once dropped into `src/assets`.

**Recommendation: A now, B later** — the lift + cross-fade interaction is what conveys the Loro Piana feel; the alternate image can be swapped any time. Confirm or pick B.

## Files touched

- `src/pages/Index.tsx` only.
  - Restructure Split Collection section (heights, caption pinning, dual `<img>` cross-fade, caption lift).
  - Replace Material-is-Memory image wrapper.
  - Add small caption-lift to "In Your Keeping" tiles (no image swap).

No CSS or config changes. No new dependencies.
