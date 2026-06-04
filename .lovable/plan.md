## Tone down the collection hover

Single edit in `src/pages/Index.tsx`, line 240 — the grid that holds the Women / Men panels.

Replace the aggressive 54fr / 46fr widen with a barely-perceptible 51fr / 49fr shift so the hovered panel only nudges a couple of pixels instead of taking over the screen. The image crossfade and 1.03 scale stay as-is (those are subtle already).

```diff
- [@media(hover:hover)]:md:[&:has(.panel-women:hover)]:[grid-template-columns:54fr_46fr]
- [@media(hover:hover)]:md:[&:has(.panel-men:hover)]:[grid-template-columns:46fr_54fr]
+ [@media(hover:hover)]:md:[&:has(.panel-women:hover)]:[grid-template-columns:51fr_49fr]
+ [@media(hover:hover)]:md:[&:has(.panel-men:hover)]:[grid-template-columns:49fr_51fr]
```

### Out of scope
Image scale, crossfade, captions, copy, snap behavior, other sections.

### Verification
At 1303×890, hover each panel: the sibling shrinks only marginally (~10–15px), nothing dominates the screen, image still crossfades and breathes.
