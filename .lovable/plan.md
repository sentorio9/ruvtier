## Fix the Women / Men split section

The last edit added `md:max-h-[calc(80svh-240px)] md:[width:auto] md:mx-auto` to the image frame. Combined with `aspect-[3/4]` and the absolute-positioned `<img>` children, `width:auto` collapsed the frame so the images no longer render and the panels lost their centering. Revert that change and use a non-destructive way to keep the section inside the scroll range.

### Change (single file: `src/pages/Index.tsx`)

1. **Restore the image frame** to the last working version:
   ```tsx
   <div className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-secondary transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:shadow-[0_30px_70px_-32px_rgba(0,0,0,0.35)]">
   ```
   This brings the two stacked `<img>` layers back, restores object-cover centering, and re-enables the hover crossfade + scale.

2. **Fit the section inside the scroll range** without touching the image. Two safe levers, applied together:
   - Drop the hard `md:h-[80svh]` lock to `md:min-h-[80svh]` so the snap target still feels like a full viewport stop but the panels can extend a touch when the 3:4 image + caption need more room (no overflow clipping, no collapsed frames).
   - Tighten the vertical breathing room from `py-[clamp(48px,7vh,96px)]` to `py-[clamp(32px,4vh,64px)]` on the inner `luxury-container`, which reclaims ~60px and keeps the eyebrow / title / CTA visible inside one snap stop at 1303×890.
   - Keep the existing `md:max-w-[80%] md:mx-auto` grid wrapper (the 20% panel-size reduction the user asked for previously) untouched.

### Out of scope
Hover behavior, caption baselines, copy, imagery, other homepage sections, tokens, and DB.

### Verification
At 1303×890, scroll into the split section: both panels are equal width, centered, both images render and crossfade on hover, eyebrow / title / CTA share baselines, and the section sits inside the snap stop without the caption being pushed below the fold.
