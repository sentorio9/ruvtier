# RUVTIER — Design System

A single canonical reference for the RUVTIER brand, written for outside
designers and AI tools recreating the house identity outside this app.

The live source of truth for tokens is `src/index.css` and
`tailwind.config.ts`. The live source of truth for copy is
`src/content/brand.ts` (mirrors Supabase fallbacks).

---

## 1. House overview

RUVTIER is a quiet-luxury fashion house devoted to permanence, material
origin, and the slow art of garment composition. The voice across the
site is contemplative, slow, and declarative. Materials are treated as
subjects — *cashmere remembers, silk carries light, denim earns its
memory through wear*. The brand never announces; it remains.

There is no figural logo. The mark is the wordmark.

---

## 2. Wordmark

```
R U V T I E R
```

- Font: **Cormorant Garamond** (display) — never Jost for the mark.
- Weight: 300 (light).
- Case: ALL CAPS — uppercase is reserved almost exclusively for the
  wordmark and small utility labels.
- Tracking: `0.28em` in the navigation header; `0.12em` in body
  references (`<span class="font-serif tracking-[0.12em]">RUVTIER</span>`).
- Letters are individually space-separated in the navigation
  (`R U V T I E R`) to create a still, architectural read.
- No figural logo, no symbol, no monogram. The wordmark stands alone.

---

## 3. Color

All values live as HSL CSS variables in `src/index.css`. Always use the
semantic Tailwind class (`bg-background`, `text-foreground`) — never the
hex.

### Paper grounds — warm cream canvas

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--background` | `30 23% 95%` | `#F6F1EA` | Page canvas across the public site. |
| `--card` | `30 23% 95%` | `#F6F1EA` | Card surfaces — identical to background. |
| `--popover` | `30 23% 95%` | `#F6F1EA` | Floating panels (drawers, menus). |
| `--secondary` | `30 15% 90%` | `#E8E2DA` | Image frame fallback, soft chips. |
| `--muted` | `30 15% 90%` | `#E8E2DA` | Quiet wells. |
| `--accent` | `30 15% 88%` | `#E3DCD2` | Slightly deeper editorial accent. |
| `--border` | `30 15% 85%` | `#DAD2C7` | Hairline rules; never thicker than 1px. |
| `--input` | `30 15% 85%` | `#DAD2C7` | Form underline. |
| `--ring` | `0 0% 23%` | `#3A3A3A` | Focus ring (ink, not blue). |

### Ink — warm charcoal, never pure black

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--foreground` | `0 0% 23%` | `#3A3A3A` | All primary type, hairlines on hover. |
| `--primary` | `0 0% 23%` | `#3A3A3A` | Buttons, focus states. |
| `--primary-foreground` | `30 23% 95%` | `#F6F1EA` | Type on ink surfaces. |
| `--muted-foreground` | `0 0% 45%` | `#737373` | Captions, eyebrows, utility labels. |

Hero overlays use `#F6F4F1` directly for the rare case where ink type sits over imagery. **Never** introduce pure black (`#000`) or pure white (`#FFF`).

### Semantic statuses

| Token | HSL | Hex | Usage |
|---|---|---|---|
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` | Destructive actions, blocking errors. |
| `--success` | `152 44% 34%` | `#317B58` | Confirmed states, sage-leaning green. |
| `--caution` | `38 70% 45%` | `#C2861F` | Soft warnings. |
| `--warning` | `22 70% 50%` | `#D9651A` | High-attention warnings (rare). |

Each has a matching `*-foreground` token for legible type on the surface.

---

## 4. Typography

Two families. Light/regular weights only — **never bold** anywhere on
the public site.

| Family | CSS var | Weights | Use |
|---|---|---|---|
| Cormorant Garamond | `--font-serif` | 300, 400, 500 | Display, titles, body in editorial blocks. |
| Jost | `--font-sans` | 300, 400, 500 | Utility, captions, CTAs, form labels. |

### The six `.type-*` classes

Defined in `src/index.css` under `@layer components`. Every public text
node should use one of these.

| Class | Family | Size (clamp) | Tracking | Use |
|---|---|---|---|---|
| `.type-display` | serif | `clamp(38px, 3.6vw, 52px)` | `0.04em` | Hero headlines, section headlines. |
| `.type-title` | serif | `clamp(24px, 2.2vw, 32px)` | `0.06em` | Card titles, sub-section headers. |
| `.type-subtitle` | serif | `clamp(17px, 1.3vw, 20px)` | `0.04em` | In-line serif support text. |
| `.type-body` | sans | `clamp(15px, 1.05vw, 17px)` | `0.01em` | Body paragraphs (line-height 1.7). |
| `.type-eyebrow` | sans | `clamp(11px, 0.82vw, 13px)` | `0.18em` UPPER | Season labels, micro-eyebrows. |
| `.type-cta` | sans | `clamp(12px, 0.9vw, 14px)` | `0.16em` UPPER | All button/link utility labels. |

### Luxury tracking tokens (7)

```
--luxury-tracking-tight:    0.02em   /* body / blurbs            */
--luxury-tracking-title:    0.08em   /* hero & section titles    */
--luxury-tracking-card:     0.10em   /* serif card titles        */
--luxury-tracking:          0.12em   /* general serif titles     */
--luxury-tracking-wide:     0.20em   /* CTA labels, small caps   */
--luxury-tracking-eyebrow:  0.22em   /* season / eyebrow labels  */
--luxury-tracking-widest:   0.32em   /* social / legal microtype */
```

Exposed as Tailwind utilities: `tracking-luxury-tight`,
`tracking-luxury-title`, `tracking-luxury-card`, `tracking-luxury`,
`tracking-luxury-wide`, `tracking-luxury-eyebrow`,
`tracking-luxury-widest`.

### Luxury leading tokens (6)

```
--luxury-leading-display:   1.15   /* large serif display     */
--luxury-leading-title:     1.20   /* card / overlay titles   */
--luxury-leading-card:      1.25   /* serif card titles       */
--luxury-leading-snug:      1.40   /* short editorial lines   */
--luxury-leading-relaxed:   1.70   /* hero serif paragraph    */
--luxury-leading-body:      1.75   /* body / blurbs           */
```

Exposed as `leading-luxury-display`, `leading-luxury-title`,
`leading-luxury-card`, `leading-luxury-snug`,
`leading-luxury-relaxed`, `leading-luxury-body`.

---

## 5. Shape, motion, shadow

- **Radius:** `--radius: 0px`. The house has no rounded corners anywhere
  on the public site. (Tailwind `rounded-*` calculations resolve to
  zero.)
- **Easing:** a single curve, used everywhere.
  ```
  cubic-bezier(0.22, 0.61, 0.36, 1)
  ```
- **Durations (canonical):** `300ms` (color/opacity), `500ms` (small
  state changes), `700ms` (hover transforms, panel lifts), `1100ms`
  (image cross-fades, slow zooms).
- **Shadow:** the only allowed shadow is the editorial hover lift used
  on collection cards.
  ```
  shadow: 0 30px 70px -32px rgba(0, 0, 0, 0.35);
  ```
  Plus a softer cream variant on the featured-pre-order frame:
  `0 24px 60px -30px rgba(58, 58, 58, 0.18)`. No card box-shadows, no
  drop shadows on type, no neumorphism.

---

## 6. Iconography

Every public-site icon is an inline SVG, **stroke width `0.6`**,
**stroke `currentColor`**, **no fill**, **no rounded line-caps unless
noted**. Custom; not from a pack.

### `Menu` (hamburger — Navigation.tsx)
```jsx
<svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="0.6">
  <line x1="0" y1="1"  x2="20" y2="1"  />
  <line x1="0" y1="6"  x2="20" y2="6"  />
  <line x1="0" y1="11" x2="20" y2="11" />
</svg>
```

### `Search` (Navigation.tsx, FullScreenMenu.tsx)
```jsx
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
  <circle cx="7" cy="7" r="5.5" />
  <line x1="11" y1="11" x2="15" y2="15" />
</svg>
```

### `Cart` (Navigation.tsx)
```jsx
<svg width="15" height="17" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="0.6">
  <path d="M1 5.5h14v11.5H1z" />
  <path d="M4.5 5.5V4a3.5 3.5 0 0 1 7 0v1.5" />
</svg>
```

### `Client Lounge` (FullScreenMenu.tsx)
```jsx
<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
  <circle cx="8" cy="5" r="3.5" />
  <path d="M1.5 15c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
</svg>
```

### `Chevron-down (double)` — hero hover affordance (Index.tsx)
```jsx
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F6F4F1" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
</svg>
```

### `Arrow-right` — card CTAs (Index.tsx)
```jsx
<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
</svg>
```

### `Newsletter submit` (LuxuryFooter.tsx)
```jsx
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
  <path d="M5 12h14M12 5l7 7-7 7" />
</svg>
```

### `Globe` — shipping region (LuxuryFooter.tsx)
```jsx
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="12" cy="12" r="10" />
  <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
</svg>
```

`lucide-react` icons used in chrome (`X`, `ChevronRight`, `ArrowLeft`)
are always passed `strokeWidth={0.6}` to match the house line weight.

---

## 7. Voice & copy rules

Every rule with a real example pulled from the codebase.

### No emoji, ever
Never appears anywhere in the codebase. There is no exception.

### No exclamation marks
The voice does not raise its volume.
- ✘ `Discover our new collection!`
- ✔ `Discover the Spring/Summer 2026 collection`

### Italics reserved for closing lines
Italics are a punctuation, not an emphasis. They mark the final cadence of a page.
- The House — *"Ruvtier does not persuade. It remains."*
- Rituals of Care — *"To restore a RUVTIER piece is not to make it new / but to allow it to continue."*
- Stillness — *"Every fibre carries origin, landscape, and time. / We begin there, in silence."*

### Em-dash for emphasis
- `Private Access — Pre-Register`
- `Available by allocation — not open purchase`
- `dry scent, matte surface, spaces shaped by proportion, light, absence`

Never an en-dash, never two hyphens.

### Quiet-luxury register
The vocabulary of allocation, appointment, and stewardship.
- `Available by allocation — not open purchase`
- `By Appointment Only`
- `Ownership is never absolute; each piece is held in stewardship.`

### Title Case for collection names
- `Women's Collection` · `Men's Collection` · `Spring / Summer 2026`
- `The Stillness Coat` · `Permanence Double-Breasted`

### UPPERCASE + tracking for utility labels
Reserved for the wordmark, eyebrows, CTAs, and small chrome.
- `R U V T I E R` (wordmark, `tracking-[0.28em]`)
- `PRIVATE ACCESS — PRE-REGISTER` (`.type-eyebrow`)
- `EUR` `EN` (currency / language toggles)

Body copy is always sentence case.

### Materials are subjects
- ✘ `Soft, luxurious cashmere`
- ✔ `Cashmere is among the most delicate fibres in the world, valued not for resilience, but for its quiet softness.`

### Prices
Zero-value items render as `€0`, **never as a dash**. EUR is the
reference currency; localised display is handled by
`useRegionCurrency`.

---

## 8. Layout tokens

```
--content-max:        1200px
--text-max:            680px

--section-gap:         120px   /* spacing between major sections */
--hero-gap:            160px   /* extra breath above/below hero  */
--heading-body-gap:     24px
--body-button-gap:      32px
```

### Responsive overrides

```
@media (max-width: 1024px) {
  --section-gap: 80px;
  --hero-gap:    120px;
}

@media (max-width: 768px) {
  --section-gap: 60px;
  --hero-gap:     80px;
  --heading-body-gap: 18px;
  --body-button-gap:  24px;
}
```

Two utility wrappers consume these:

- `.luxury-container` — `max-width: var(--content-max)`, horizontal
  padding `24px` (desktop) / `20px` (≤768px).
- `.luxury-section` — vertical padding `var(--section-gap)` top and
  bottom.

Body copy ceilings at `var(--text-max)` for readability.

---

*This document is the contract. If the live UI ever drifts from it,
the UI is wrong, not the document — update the document only when an
intentional decision is made and reflected in `src/index.css`.*
