## Goal

Turn the homepage into a Loro Piana–style editorial sequence: each scroll lands cleanly on a full-viewport "chapter," motion is smooth and decelerated, and every chapter is fully visible (no clipped captions, no clunky Women/Men cards).

## Problems today

1. No snap behavior — scroll lands arbitrarily mid-section.
2. Women/Men cards are tall `aspect-[3/4]` images PLUS a `pb-32 md:pb-36` reserved caption strip that sits below the image. On a 1303×890 viewport the caption is cut off and the two cards feel cramped/clunky.
3. Caption-on-hover-only means at rest the cards look label-less and unfinished.
4. Sections have inconsistent heights, so scrolling never feels "one screen = one idea."

## Plan

### 1. Page-snap scrolling (homepage only)

- Wrap the homepage in a snap container: `h-[100svh] overflow-y-scroll snap-y snap-mandatory scroll-smooth` on the root `<div>` in `src/pages/Index.tsx`.
- Each chapter becomes `min-h-[100svh] snap-start snap-always flex flex-col` so it fills the viewport and the browser decelerates onto it.
- Add `scroll-padding-top` equal to the fixed nav height so chapters align under the header.
- Respect `prefers-reduced-motion`: drop `scroll-smooth` and `snap-mandatory` → `snap-proximity` via a `motion-safe:` / `motion-reduce:` split.
- Keep native scrolling (per project memory — no JS scroll hijack, no Lenis).

Chapters (one screen each):
1. Hero ("Permanence in garment form")
2. Featured Pre-Order (silk scarf / featured product)
3. Women + Men split collection
4. Material is Memory (scarf editorial)
5. In Your Keeping (3-card explore row)
6. Footer (allowed to be shorter; `snap-end`)

### 2. Rebuild Women / Men chapter (the clunky one)

Loro Piana pattern: two tall images sit side-by-side, each with its caption **always visible and quiet** beneath the image, and a subtle lift/veil on hover.

- Remove the `pb-32 md:pb-36` reserved strip and the `absolute top-full` caption that translates upward on hover.
- New structure per card:
  - `<Link class="group flex flex-col h-full">`
  - Image frame: `flex-1 min-h-0 aspect-auto overflow-hidden` so the image fills the available vertical space inside the 100svh chapter (no fixed aspect ratio fighting the viewport).
  - Caption block: static, sits below the image, always visible — eyebrow (season), serif title, CTA with underline-on-hover. Spacing `pt-5 md:pt-6`, centered.
- Hover refinement (kept, calmer):
  - Image: `scale-[1.015]` + `brightness-[0.96]`, 1100ms.
  - Bottom gradient veil inside the image frame fades in (`from-black/35 via-black/10`).
  - CTA underline sweeps in.
- Section shell: `min-h-[100svh] snap-start flex items-center` with `luxury-container grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 py-[clamp(64px,10vh,120px)]`.
- Image aspect on desktop is governed by the chapter height, not a hard `3/4`, so both cards + captions fit on 890px viewports without clipping.

### 3. Tighten the other chapters to fit one screen

- Hero already `min-h-[100svh]` — keep.
- Featured Pre-Order: change outer `<section>` to `min-h-[100svh] snap-start flex items-center`, reduce inner `py-20 md:py-28` to `py-[clamp(48px,8vh,96px)]`, image `aspect-[3/4] max-h-[80svh] w-auto mx-auto` so it never overflows.
- Material is Memory: same `min-h-[100svh] snap-start flex flex-col items-center justify-center`, scarf image capped at `max-h-[55svh]`.
- In Your Keeping: `min-h-[100svh] snap-start flex flex-col justify-center`, heading + 3-card row sized to fit without scroll-within-section. Drop the `pb-20 md:pb-24` reserved strip; captions always visible under each tile.
- Footer chapter: `snap-start` only (no min-h forced), `snap-always` so the last snap lands at the footer cleanly.

### 4. Motion + easing

- All transitions continue using `cubic-bezier(0.22, 0.61, 0.36, 1)`, 550–900ms (per Motion Principles memory).
- Snap deceleration is native; no custom JS.
- ScrollFadeIn already in use — keep it; it works inside snap containers (IntersectionObserver fires on snap settle).

### 5. Scope of files

- `src/pages/Index.tsx` — only file edited. Restructure the root wrapper, the Women/Men section, and add `min-h-[100svh] snap-start` to each `<section>`.
- No CSS file changes required; all done via Tailwind utilities.
- No changes to Navigation, Footer, or any other route.

## Open question

Snap behavior on **mobile** (small viewports) can feel aggressive when chapters are taller than the screen. Recommendation: enable snap **only at `md:` and up** (`md:snap-y md:snap-mandatory`), leave mobile as normal scroll. Confirm or override.

## Out of scope

- No changes to copy, images, product data, or routes.
- No new dependencies (no Lenis, GSAP ScrollTrigger, Locomotive).
- No JS scroll-jacking — strictly CSS `scroll-snap`.
