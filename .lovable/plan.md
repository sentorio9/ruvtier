# Unify phone + tablet layout

The site already uses `md:` (768px) utilities as the "tablet baseline" and bare classes as the phone-only fallback. Instead of rewriting every component, we eliminate the divergence at the source: make `md:` apply from 0px upward, and treat 1024px (`lg`) as the only real breakpoint (desktop). The tablet layout then scales down fluidly to phone widths automatically.

## Changes

**1. `tailwind.config.ts` — redefine breakpoints**
Add an explicit `screens` map so `md` triggers from 0px:
```ts
screens: {
  sm:  '0px',     // legacy sm utilities also apply everywhere
  md:  '0px',     // tablet baseline = phone baseline
  lg:  '1024px',  // desktop unchanged
  xl:  '1280px',
  '2xl': '1400px',
}
```
Result: every `md:foo` utility in the codebase now applies at all widths < 1024px too. `max-md:` selectors become inert (none in code anyway). Desktop (`lg:`) behaviour is unchanged.

**2. `src/hooks/use-mobile.tsx` — raise the breakpoint to desktop**
Change `MOBILE_BREAKPOINT` from `768` → `1024`. Phones and tablets both report `isMobile=true`, so the existing tablet chrome (single nav row, mobile drawer in `FullScreenMenu`, etc.) is shared between them. This matches what the user sees on tablet today.

**3. Remove the now-redundant duplicate CTAs**
In the homepage these blocks used `md:hidden` to give phones their own bottom "View all" link below the grid. With `md:` now applying everywhere, the desktop-style inline CTA in the header is already visible on phone, so the duplicates can be deleted:
- `src/pages/Index.tsx` lines 344–352 (The Edit phone-only "View all").
- `src/components/home/TheIcons.tsx` lines 129–137 (The Icons phone-only "View all").

**4. `src/components/LuxuryFooter.tsx` — drop the mobile-only column block**
The footer renders two parallel trees: `<div className="md:hidden">` (mobile accordion/stacked) and `<div className="hidden md:grid …">` (tablet 6-col grid). With the new breakpoints the tablet grid would show on phones already, but the mobile block would also still render (its `md:hidden` becomes always-hidden under the new config — perfect, it stops rendering). No code change strictly needed beyond verifying nothing else relies on the phone layout. We will leave that file untouched if the grid renders cleanly at 390px, otherwise lightly adjust column gaps.

**5. Fluid-width audit (no overflow at 375–430px)**
The homepage uses `.luxury-container` (max-width 1200, padding 64/32/20px responsive) and grid utilities with `clamp()` gaps already. After the breakpoint change, check:
- `.luxury-container` still has its 20px phone padding via `@media (max-width: 768px)` in `index.css` — keep.
- `Index.tsx` Split Collection grid `grid-cols-2 gap-4 md:gap-8` will keep both tiles side-by-side at 390px (~165px each). Verify no text overflows; if the card min-heights look cramped, leave as is (tablet renders the same).
- The Edit `grid-cols-2 md:grid-cols-4` now renders **4 columns from 0px upward**. At 390px each tile is ~85px — too tight. This is the intentional "smaller tablet" outcome the user asked for, but we should sanity check; if it reads as broken, we keep `grid-cols-2 md:grid-cols-4` by reverting to 2 columns ONLY at <500px via `[@media(max-width:500px)]:grid-cols-2`. **Decision below.**
- The Icons `grid-cols-1 md:grid-cols-3` → 3 columns at 390px (~115px each). Same caveat.

## The one judgment call

Strictly applied, "phone = smaller tablet" means The Edit shows 4 columns and The Icons shows 3 columns at 390px — product tiles become ~85–115px wide. That is what the instruction asks for ("the same grid column counts … should also apply at phone widths"), and the layout will not overflow because images use `w-full`/`object-cover`. The plan keeps it that way. If after building it visibly breaks the read of a product image, we can re-introduce a single fluid fallback (e.g. switch to 2 cols below ~520px via an inline `[@media(max-width:520px)]:grid-cols-2`), but only if you confirm you want that — the request explicitly forbids phone-only column changes.

## Tap targets

All nav/CTA links already use `.luxury-button` or `type-cta` with ≥14px text + padding. After scaling, anchor tiles cover whole image cards (well over 44px). No extra padding utilities needed.

## Test matrix

- 768px viewport: identical to today (md utilities were already applied).
- 390px viewport: same DOM/layout as 768px, scaled. No horizontal scroll (verify `document.documentElement.scrollWidth === innerWidth`).
- 1024px+: unchanged.
