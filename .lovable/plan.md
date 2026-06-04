## Shrink split section by 10% so caption fits in viewport

Single file: `src/pages/Index.tsx`.

**Reduce the grid width from 80% → 72%** (10% smaller). Narrower panels → shorter 3:4 images → caption (eyebrow / title / CTA) sits inside the 100svh snap stop instead of dropping below the fold.

```diff
- <div className="grid grid-cols-1 gap-10 md:gap-8 md:max-w-[80%] md:mx-auto ...">
+ <div className="grid grid-cols-1 gap-10 md:gap-8 md:max-w-[72%] md:mx-auto ...">
```

### Out of scope
Image markup, hover (51/49 + 1.01 scale stays), captions, copy, snap behavior, other sections.

### Verification
At 1303×890, snap to split section: both images + season + title + CTA all visible within one snap stop.
