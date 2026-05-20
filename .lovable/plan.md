Convert the homepage collection cards so the text caption (eyebrow + title + CTA) overlays the lower section of the image on hover, instead of sitting permanently underneath. Inspired by Loro Piana's editorial cards.

## Scope
File: `src/pages/Index.tsx` only.
Targets:
- Women's Collection card (section 3, left)
- Men's Collection card (section 3, right)
- "In Your Keeping" cards (Knitwear / Life in RUVTIER / By Appointment Only)

Out of scope: hero, Material is Memory section, copy, colors, layout grid, fonts.

## Resting state
- Image fills the card at its current `aspect-[3/4]` (Women/Men) and `aspect-[4/5]` (In Your Keeping).
- Caption block is **absolutely positioned over the image**, anchored to the bottom (`absolute inset-x-0 bottom-0`), with internal padding (`px-6 pb-6 md:pb-8`).
- At rest:
  - Eyebrow + CTA: `opacity-0`, translated down ~12px.
  - Title: visible but translated down ~8px and slightly dimmed (`opacity-90`), so the card still reads at rest with just the collection name softly present at the bottom of the image — matches Loro Piana's "always-visible title, reveal-on-hover meta" pattern.
  - A subtle bottom gradient veil sits behind the text for legibility: `bg-gradient-to-t from-black/35 via-black/10 to-transparent`, `opacity-0` at rest, fading in on hover. Text color becomes `text-[#F6F4F1]` while overlay is visible to stay on-brand against imagery.

## Hover state (group-hover on the Link)
- Gradient veil fades in (`group-hover:opacity-100`, 700ms).
- Eyebrow: fades in + lifts to position (`group-hover:opacity-100 group-hover:translate-y-0`).
- Title: fully opaque, lifts to final resting offset (a few px above bottom padding), giving the "rise into the image" motion.
- CTA row (Discover More / Explore Collection + arrow): fades in + lifts in last with a small delay (`delay-100`).
- Image gets a very gentle `group-hover:scale-[1.015]` (already present) and a slight darken (`group-hover:brightness-95`) so light text reads cleanly.
- All transitions use the existing easing: `duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]`. Stagger via Tailwind `delay-` utilities (0 / 75 / 150).

## "In Your Keeping" cards
- Same pattern, scaled to the smaller card:
  - Image stays in its current bg-background frame; caption (`<h3>` + "Explore") becomes an absolute overlay anchored bottom with `px-4 pb-4`.
  - At rest: title visible (slightly translated + 90% opacity), "Explore" hidden.
  - On hover: gradient veil fades in, title lifts to final position, "Explore" fades in below it.
- Remove the current `mt-6` / `mt-3` margins under the image since text is now over the image. Card overall height shortens to just the image frame.

## Accessibility & reduced motion
- Keep all text in DOM at all times (no `hidden`), only opacity/transform — screen readers + SEO unaffected.
- Wrap transforms/opacity behind `motion-safe:` variants; under `motion-reduce`, show the caption permanently visible over the image (veil at `opacity-100`, no translate) so the layout still works without motion.
- Ensure focus-visible on the Link triggers the same reveal: add `group-focus-visible:` mirrors of each `group-hover:` class.

## Implementation notes
- Each card's `<Link>` already has `group` — reuse it.
- Wrap image + caption in a single `relative` container (the existing image wrapper div). Move the caption `<div>` *inside* that container, after the `<img>`, with `absolute inset-x-0 bottom-0 z-10`.
- Veil is a sibling `<div aria-hidden>` between image and caption, also absolute.
- Keep the `<Editable>` wrappers exactly where they are — only their parent positioning classes change.
- No new dependencies, no CSS file edits.

## Visual reference behavior
Like Loro Piana boutique tiles: a calm photograph with the collection name quietly anchored at the lower-left/center of the image; on hover, a soft veil rises and the season eyebrow + CTA reveal beneath the title, lifting a few pixels into place.
