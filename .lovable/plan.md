Add subtle "pop" motion to the selected homepage items on hover and as they scroll into view. Keep it within the quiet-luxury motion language (cubic-bezier(0.22,0.61,0.36,1), 550–900ms, very small translation).

## Scope
File: `src/pages/Index.tsx` only. Targets:
- Women / Men collection card text blocks (eyebrow, title, CTA) — sections 3
- "Material is Memory" headline + CTA — section 4
- "In Your Keeping" cards (image, title, Explore) — section 5

## Behavior

### Hover
- Each card text block already lives inside a `group` `<Link>`. Add a small grouped lift to the **text caption container**:
  - `transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:-translate-y-1`
- For the eyebrow + title, add a gentle staggered lift via additional transforms:
  - eyebrow: `group-hover:-translate-y-0.5`
  - title: `group-hover:-translate-y-1`
  - CTA already animates underline; add `group-hover:translate-y-0.5` for a tiny settle.
- "In Your Keeping" cards: image already scales 1.02; add `group-hover:-translate-y-1` to the title, and lift the whole card slightly via `transition-transform duration-700 group-hover:-translate-y-1` on the `Link`.

### Scroll-in pop
- Items are already wrapped in `ScrollFadeIn`, which fades + lifts the whole block. To make individual text elements "pop" sequentially as they enter, add a CSS-only stagger using a new utility class in `index.css`:
  - `.pop-in > *` → `opacity:0; transform: translateY(8px);`
  - When parent has `.in-view` (set by ScrollFadeIn once visible) → children animate to `opacity:1; translateY(0)` with per-index `transition-delay` via `nth-child` (60ms steps), `duration: 700ms`, ease as above.
- Apply `pop-in` class to the caption `<div>` of each Women/Men/Material card and to each Explore card body.

### Implementation notes
- Confirm `ScrollFadeIn` adds an `in-view` (or similar) class to its root once visible. If it uses inline styles only, extend it minimally to also toggle a `data-in-view` attribute and target via `[data-in-view='true'] > .pop-in > *` — purely additive, no behavior change for existing usages.

## Out of scope
- No copy changes, no layout changes, no color changes.
- No new dependencies (pure Tailwind + existing easing tokens + one small CSS utility).