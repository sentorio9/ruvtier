# Loro Piana–style caption reveal

Captions currently sit overlaid on the image and only fade in on hover. Change so that at rest they live in a quiet block **below** the image, and on hover they smoothly translate up to settle over the lower section of the image — matching loropiana.com.

## Behaviour

**Rest state**
- Image fills its `aspect-[3/4]` (Women/Men) or `aspect-[4/5]` (In Your Keeping) frame, no overlay veil, no text on top.
- Caption block (eyebrow + title + CTA) sits directly beneath the image, left-aligned, in foreground text color, with normal page background. Modest top spacing (`mt-5 md:mt-6`).

**Hover / focus-visible state**
- Caption block translates upward into the lower portion of the image (`translate-y-[-100%]` of its own height, or a fixed `-translate-y-[88%]`), text color shifts to `#F6F4F1`.
- A soft bottom-anchored gradient veil fades in inside the image frame (`from-black/45 via-black/15 to-transparent`, bottom half) so the text stays legible.
- Image gets a gentle `scale-[1.015]` and `brightness-[0.95]`.
- Underline sweep on the CTA label remains.

**Motion**
- All transitions `cubic-bezier(0.22, 0.61, 0.36, 1)`, 700–900ms; image transform 1100ms.
- `motion-reduce`: no translate, no scale — caption simply stays below the image and the veil does not appear.

## Structure change

For each card, wrap the existing `<Link>` content in a single `relative` container, and split into:

```text
<Link class="group block">
  <div class="relative aspect-[3/4] overflow-hidden">   ← image frame (clips the rising caption)
    <img ... />
    <div aria-hidden class="... gradient veil, opacity-0 group-hover:opacity-100" />
    <div class="absolute left-0 right-0 top-full
                translate-y-0 group-hover:-translate-y-[88%]
                px-6 pb-6 md:pb-8 text-foreground group-hover:text-[#F6F4F1]
                transition-[transform,color] duration-[800ms] ease-...">
      eyebrow / title / CTA (no per-element opacity tricks)
    </div>
  </div>
</Link>
```

Key points:
- `overflow-hidden` on the image frame clips the caption when it rises, so it appears to slide *out from under* the image.
- Caption is positioned with `top-full` so at rest it sits flush below the image (its natural place visually); reserve matching outer spacing so layout doesn't jump — done by giving the outer `<Link>` `pb-[var(--caption-h)]` via a fixed `pb-24 md:pb-28` (tuned per card) so the column grid stays stable whether hovering or not.
- Text alignment switches from current `items-center text-center` to `items-start text-left` to match Loro Piana editorial style. (Confirm — see question.)

## Files
- `src/pages/Index.tsx` only — Women card (~205–235), Men card (~239–270), and the three "In Your Keeping" cards (~336–357). No CSS, config, or new deps.

## Open question
Loro Piana captions are left-aligned. Current cards are centered. Switch to **left-aligned** to match the reference, or keep **centered**?
