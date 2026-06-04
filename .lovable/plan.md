
## Scope

Refine the Women/Men split section on `src/pages/Index.tsx` and replace the four images with a cohesive AI-generated campaign shoot.

## 1. Generate four campaign images

Use `imagegen--generate_image` with `model: premium` (text-free editorial photography needs the higher fidelity tier). All four share one prompt scaffold — fixed background (#C9C2B6 warm greige seamless), soft diffused window key light from the left, medium-format 80mm look, shallow DOF, desaturated warm filmic grade, palette limited to ivory/camel/taupe/charcoal + one deep accent. 3:4 portrait, eye-line consistent, no text/logos.

- `src/assets/collection-women-primary.jpg` — female, three-quarter stance, ivory high-neck sleeveless knit + wide cream trousers, looking off-camera.
- `src/assets/collection-women-hover.jpg` — same model/set, closer crop on knit weave, hands + torso, face partially out of frame.
- `src/assets/collection-men-primary.jpg` — male, standing, burgundy honeycomb mock-neck + stone pleated trousers, cream leather holdall, cropped just above chin.
- `src/assets/collection-men-hover.jpg` — same look, detail crop: sweater texture, hand in pocket, holdall strap, no face.

Generate sequentially so each prompt can reference the prior shot's grade/background language to keep the campaign cohesive.

## 2. Refactor the split section in `src/pages/Index.tsx`

Replace the existing Women/Men `section` (the one that maps over two card configs) with a tighter layout:

- **Aspect lock**: each panel uses `aspect-[3/4]` on desktop and `aspect-[4/5]` on mobile (replaces the current `md:h-full` flex sizing). Drop `md:max-h-[calc(100svh-96px)]`.
- **Equal panels with hover widen**: wrap both panels in a CSS grid where each column is `grid-template-columns: 1fr 1fr` by default. On `group/panel` hover, use a parent `has-[:hover]` selector or a small piece of state to shift to `54fr 46fr` with `transition: grid-template-columns 500ms ease`. Tailwind arbitrary value `grid-cols-[1fr_1fr] [&:has(.panel:hover)]:grid-cols-[54fr_46fr]`. Disable via `@media (hover: none)` so touch devices keep 1:1.
- **Image crossfade**: two `<img>` stacked `absolute inset-0`, primary `opacity-100`, hover `opacity-0`; on group hover invert. `transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]`. Visible image scales 1 → 1.03 over the same 600ms via `transition-transform`. Wrap both in `@media (hover: hover)` (Tailwind `hover:` already gated; add `motion-safe:` + `[@media(hover:none)]:transform-none [@media(hover:none)]:opacity-100` guards on the hover image to keep tap clean).
- **Caption baselines**: lift the eyebrow/title/CTA out of the current `h-[110px]` lifting panel and put them in a fixed-height caption row beneath the image with `min-h-[140px]` and `flex flex-col justify-between` so eyebrow / title / CTA align across panels. Remove the existing `group-hover:-translate-y` lift (no longer needed — caption is always visible at the same baseline).
- **CTA copy + animation**: replace `cta` labels with `DISCOVER WOMEN →` / `DISCOVER MEN →` (move into `HOME_WOMEN_CARD.cta` / `HOME_MEN_CARD.cta` in `src/content/brand.ts`). Underline already animates left-to-right via the existing `scale-x-0 group-hover:scale-x-100` span — keep that, ensure both share `tracking-luxury-wide` for identical letter-spacing.
- **Imagery wiring**: import the four new assets, pass `primary` and `secondary` per card. Remove the `heroImage`/`lifestyleImg` fallbacks (constraint #4).

## 3. Content updates

In `src/content/brand.ts` update `HOME_WOMEN_CARD.cta` to `DISCOVER WOMEN →` and `HOME_MEN_CARD.cta` to `DISCOVER MEN →` (keep existing season/title/blurb).

## Out of scope

- No changes to other homepage sections, header, footer, or admin editor.
- No new tokens — reuses existing `type-eyebrow`, `type-title`, `type-cta`, `tracking-luxury-wide`, and the standard easing curve.
- No DB / RLS / backend work.

## Verification

- Visit `/` at 1303×890: panels equal width, captions on identical baselines, hover crossfades over 600ms, hovered panel widens to ~54%, sibling shrinks, underline sweeps in from left.
- Resize ≤ md: panels stack full-width 4:5, no hover effects fire, tap navigates.
- Confirm all four generated images share background tone, lighting direction, and grade.
