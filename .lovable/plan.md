## Reference read — what Loro Piana actually does

Looking at ii.loropiana.com:

- Text is **never the thin, low-contrast layer** it currently is on RUVTIER. Headings sit at a solid weight (~400, not 300), in a warm dark colour, at full opacity.
- Critical text (titles, "Women", "Men") **lives on cream chrome, not on the imagery**. The Resort 2026 card is a solid cream block beside the image, not an overlay on top of it.
- Microtype (top-bar "Discover our Gift Card", nav) is small but **dark and crisp**, no opacity dimming, modest letter-spacing, never `/70`.
- Letter-spacing is restrained on body/titles; only small-cap labels get wide tracking.
- Sizes are comfortable: nav ~13–14px, card title ~28px, no feathery clamp values.

## What's hurting visibility on RUVTIER today

After the last pass we have one shared scale, but it's tuned **toward whisper, not toward read**:

1. **Weights are all 300 (light).** Cormorant 300 + Jost 300 disappear on cream backgrounds, especially the body/eyebrow.
2. **Colour opacities are stacked on top of muted tokens.** Card text is `text-[#3A3A3A]/70`–`/85`, blurbs use `text-muted-foreground`. Two layers of dimming = grey-on-cream.
3. **Hero/Women/Men titles sit directly on imagery,** propped up by cream halos and shadows. That's the opposite of the Loro Piana approach — they take the text off the image.
4. **Type sizes are small at the low end of every clamp** (eyebrow 10px, body 14px, cta 11px), so on the typical 1080–1280px viewport everything renders near the floor of the scale.
5. Some places still pile shadows + glow on text to compensate for low contrast (Material is Memory headline, hero pre-order links).

## Plan — visibility pass, fonts unchanged

### 1. Re-tune the 6-step scale in `src/index.css`

Same six classes (`type-display / title / subtitle / body / eyebrow / cta`), same families (Cormorant Garamond + Jost), but:

```text
display   serif 400  clamp(38px, 3.6vw, 52px)  track 0.04em  leading 1.15
title     serif 400  clamp(24px, 2.2vw, 32px)  track 0.06em  leading 1.25
subtitle  serif 400  clamp(17px, 1.3vw, 20px)  track 0.04em  leading 1.4
body      sans  400  clamp(15px, 1.05vw, 17px) track 0.01em  leading 1.7
eyebrow   sans  500  clamp(11px, 0.82vw, 13px) UPPER track 0.18em
cta       sans  500  clamp(12px, 0.9vw, 14px)  UPPER track 0.16em
```

Key changes vs. now: weights move 300→400 (display/title/subtitle/body) and 400→500 (eyebrow/cta), minimum sizes go up ~1–2px, letter-spacing tightens. Memory rule "light/regular weights only — never bold" is respected: 400 = regular, 500 = medium, no 600/700.

`color` on every class becomes the full token (`hsl(var(--foreground))` for display/title/subtitle/cta, `hsl(var(--foreground))` at full strength for body too — we drop `--muted-foreground` from the body class and use it only on truly secondary captions). Eyebrow stays muted but at the new heavier weight.

### 2. Strip the dimming wrappers

Across `Index.tsx`, `Materials.tsx`, `CollectionPage.tsx`, `BoutiqueCategoryPage.tsx`, `PreorderPage.tsx`:

- Remove `text-[#3A3A3A]/70`, `/80`, `/85`, `/95` — text is full `#3A3A3A`.
- Remove `text-muted-foreground` from primary read-paths (product names, blurbs, prices). Keep it only for genuine secondary metadata (image captions, "Available by allocation").
- Remove every `[text-shadow:...]` and `drop-shadow-[...]` on text — the new weight + position make them unnecessary.

### 3. Lift titles **off** the imagery (the Loro Piana move)

Currently Women/Men card titles, blurbs and CTA float over the photo, propped up by cream gradients + halos. New layout:

- Photo stays the photo. Aspect, zoom-on-hover and shadow stay.
- Below the photo, a thin cream caption block: eyebrow (season) — title — blurb — CTA arrow. All `type-eyebrow / type-display / type-body / type-cta`, full colour, no shadows, no halos, no overlay gradient.
- Drop the inner `bg-gradient-to-t from-cream`, the `radial-gradient` halo div behind the title, and the cream text-shadows on the card text. Hover affordance on the photo is preserved.
- Same treatment for **Material is Memory**: keep the silk-scarf image, but render the headline + CTA in a centred cream block underneath, not over the image.
- **In Your Keeping**: already off-image, just adopt the new heavier classes.

### 4. Hero — keep over image, but make it carry

The hero ("Permanence in garment form") stays centred on the image because the composition depends on it. To make it visible without the current shadow-stack:

- Promote the headline to `type-display` (was `type-title`) and full `text-foreground`.
- Replace the layered `text-shadow` + halo div with a single, calmer cream backdrop: a soft ~140% × 220% radial cream wash (`rgba(245,241,235,0.45) → 0`) sitting in `.hero-glow::before`. Same `hero-glow` hook, simpler implementation.
- Pre-order links under the hero adopt `type-cta` at full `text-foreground`, no shadow.

### 5. Sweep the rest

- Navigation, footer, cart drawer, client lounge, search overlay: replace ad-hoc `text-[Npx] tracking-[Nem]` with the six tokens. No restyle, just consistency — same families, the new weights/sizes carry through.
- Filter chips on `CollectionPage` (currently `type-subtitle`) become `type-cta` to match Loro Piana's small-cap tab feel.

### 6. Verify

Reload `/`, `/material-is-memory`, `/collection/women`, `/collection/men`, `/preorder`, `/boutique/women` at desktop **and** the current 1075px viewport, plus mobile. Confirm:
- All text sits at full strength dark grey on cream — no greyed-out bodies.
- Titles are clearly readable without halos / shadows.
- Hero line reads at a glance against the image.
- Family + light/regular discipline preserved (no bold anywhere).

## What does **not** change

- Font families: Cormorant Garamond + Jost.
- Brand colours, off-white #F6F4F1 / dark grey #3A3A3A.
- Layouts, images, scroll behaviour, animations.
- Admin panel typography (separate system).

## Scope

Steps 1–4 are the visible upgrade. Step 5 is the consistency sweep so the site stops drifting back; step 6 is verification. I'll do all of it in one pass unless you'd rather I land 1–4 first and check it before the sweep.