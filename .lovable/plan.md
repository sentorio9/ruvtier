## Audit — what's actually inconsistent

The two font families are already correct everywhere: **Cormorant Garamond** (serif, weight 300) for display/titles, **Jost** (sans, weight 300/400) for eyebrows, blurbs, CTAs. So this isn't a font-family problem — it's a **type-scale problem**. Sizes, tracking and line-heights are hand-tuned per block, which is why the landing page feels visually jittery next to the rest of the site.

Examples found on the landing page alone:
- Hero title: `text-[clamp(22px,2.42vw,31px)] tracking-[0.08em] leading-[1.7]`
- Women/Men card title: `text-[clamp(26px,2.6vw,38px)] tracking-luxury-card`
- Material is Memory title: `text-[clamp(28px,3.2vw,44px)] tracking-[0.04em]`
- "In Your Keeping" heading: `text-[clamp(18px,1.6vw,22px)] tracking-[0.15em]`
- Eyebrows: a mix of `tracking-[0.22em]`, `tracking-[0.3em]`, `tracking-luxury-eyebrow`
- Blurbs: `text-[clamp(11px,0.84vw,13px)]` vs `text-[clamp(14px,1.05vw,16px)]` vs global `luxury-body` (15–18px)
- CTAs: `tracking-[0.08em]`, `tracking-[0.2em]`, `tracking-luxury-wide` all coexist

Other pages (Materials, Collection, Boutique, Preorder) each invent their own sizes too (`text-base md:text-lg`, `text-2xl md:text-3xl`, `!text-[clamp(16px,1.5vw,20px)]`).

There already are luxury tokens in `index.css` (`--luxury-tracking-*`, `--luxury-leading-*`, `luxury-heading`, `luxury-body`, `luxury-button`) — they're just under-used.

## Plan — one shared type system, applied first to the landing page

### 1. Lock a 5-step type scale (in `src/index.css`)

Extend the existing luxury tokens into a single, named scale used everywhere:

```text
display   serif 300  clamp(34px, 3.4vw, 46px)  track 0.08em  leading 1.15  → Women/Men/Material titles
title     serif 300  clamp(22px, 2.2vw, 30px)  track 0.10em  leading 1.25  → Hero title, "In Your Keeping"
subtitle  serif 300  clamp(16px, 1.3vw, 19px)  track 0.06em  leading 1.4   → product titles, card subheads
body      sans  300  clamp(14px, 1.0vw, 16px)  track 0.02em  leading 1.75  → blurbs, paragraphs
eyebrow   sans  400  clamp(10px, 0.78vw, 12px) uppercase track 0.22em      → season labels, small caps
cta       sans  400  clamp(11px, 0.85vw, 13px) uppercase track 0.20em      → all text-only buttons / links
```

Expose them as component classes: `.type-display`, `.type-title`, `.type-subtitle`, `.type-body`, `.type-eyebrow`, `.type-cta`. Refresh the existing `.luxury-heading` / `.luxury-body` / `.luxury-button` to alias these so older pages keep working.

### 2. Refactor the landing page (`src/pages/Index.tsx`) to use only those classes

- Hero title → `type-title` (keeps the `hero-title` halo class for legibility, removes the inline clamp/tracking/leading).
- Pre-order links under the hero → `type-cta`.
- Women's & Men's card season label → `type-eyebrow`; title → `type-display`; blurb → `type-body`; "Discover" link → `type-cta`.
- "Material is Memory" eyebrow / title / paragraph / pull-quote → `type-eyebrow` / `type-display` / `type-body` / `type-subtitle italic`.
- "In Your Keeping" heading → `type-title`; item titles → `type-subtitle`; price → `type-body italic`; "View" → `type-cta`.

Strip every `text-[clamp(...)]`, `tracking-[...]`, `leading-[...]` on text nodes in `Index.tsx`. Colour, spacing and the existing glow/shadow utilities stay untouched — this is a typography-only pass.

### 3. Bring the rest of the site in line (smaller follow-up edits, same classes)

- `Materials.tsx`, `CollectionPage.tsx`, `BoutiqueCategoryPage.tsx` product/category titles → `type-subtitle`; prices → `type-body`.
- `PreorderPage.tsx` heading → `type-title`, labels → `type-eyebrow`, submit button → `type-cta`.
- Anywhere else still using ad-hoc sizes gets swept in the same pass.

### 4. Verify

After changes: load `/`, `/material-is-memory`, `/collection/women`, `/collection/men`, `/preorder` in the preview and confirm hero, card, section and CTA type all share the same rhythm; check mobile (≤768px) and desktop.

## What does NOT change

- Font families (Cormorant Garamond + Jost) — already correct.
- Colours, spacing tokens, layout, images, glow/halo effects.
- Admin panel typography (intentionally a different system per memory).

## Scope of this task

Step 1 + Step 2 (tokens + landing page) are the core deliverable the user asked for. Step 3 is included so the landing page doesn't drift away from the rest of the site again; I'll do it in the same pass unless you'd rather keep it landing-only.