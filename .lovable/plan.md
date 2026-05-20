Remove the following items from `src/pages/Index.tsx`:

1. **Women's collection blurb** (line 220-222) — the `<Editable as="p">` containing "Refined silhouettes shaped by material devotion…"
2. **Men's collection blurb** (line 255-257) — the `<Editable as="p">` containing "Understated forms built from heritage craft…"
3. **Explore section captions** (line 346-348) — remove the `<span>` rendering `{item.caption}` for all three cards (Knitwear, Life in RUVTIER, By Appointment Only). The `caption` field can also be removed from the array entries on lines 326-328 to keep data clean.

No other layout or spacing changes; the surrounding eyebrow, title, CTA, and grid structure stay intact.