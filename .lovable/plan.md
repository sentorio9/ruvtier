## Goal
Never show the cookie banner and the region/currency prompt at the same time. Adopt your preferred optional path: auto-detect the region silently, drop the first-load region popup entirely, and surface a small "Shipping to [country] — [currency] ⌄" affordance that opens the existing selector. Cookie banner remains the only first-load overlay.

## Changes

### 1. `src/App.tsx`
- Remove `<LocationConsentPrompt />` from the render tree (and its import). The component file stays in the repo for now but is no longer mounted — safe to delete in a follow-up if you confirm.
- Keep `<CookieConsent />` exactly where it is.

### 2. `src/hooks/useRegionCurrency.tsx`
- In the initial mount effect, stop setting `needsLocationConsent` to `true`. Auto-detection from timezone already runs and is persisted, so first-time visitors get a sensible default silently.
- Keep `acceptLocationConsent` / `dismissLocationConsent` exported (no breaking API change) but they become no-ops from the UI side — the footer/header affordance uses `setRegion` directly via the existing selector.
- Persistence is unchanged: `ruvtier_region` already survives reloads, so returning visitors keep their choice.

### 3. New affordance: `src/components/ShippingToBadge.tsx`
- Small text-only control matching quiet-luxury tokens (`type-eyebrow tracking-luxury-wide text-foreground/55 uppercase`, no boxes, no bg).
- Renders: `Shipping to {region.country} — {region.currency} ⌄` with a hairline underline-on-hover (same pattern as other links).
- Click opens the existing `<RegionSelector />` (reuse it as a controlled dialog/drawer with the project's standard transitions and easing — no new modal styling). Closes on Escape and outside click per Performance Architecture rules.

### 4. Placement of the affordance
- **Footer (`src/components/LuxuryFooter.tsx`)**: replace/augment the current region row so the badge is always available — this is the "permanent way" the brief asks for.
- **Header (`src/components/Navigation.tsx`)**: add the same badge in the desktop top utility row only (mobile keeps the footer entry to avoid header crowding). It sits inline with existing utility links; no background, no icon weight changes.

### 5. Cookie consent timing
- No code change to `CookieConsent.tsx` itself — it already self-gates on `ruvtier_cookie_consent` in localStorage, persists the choice, and never reappears. Because the region prompt is gone, the two can no longer overlap by construction.

## What this delivers vs the brief
1. First load shows only the cookie banner. ✅ (region popup removed entirely)
2. No second popup needed after cookie choice — region is already auto-detected. ✅
3. Cookie consent stays standalone. ✅
4. Both decisions persist (`ruvtier_cookie_consent`, `ruvtier_region`). ✅
5. Region selector remains in the footer + new header badge. ✅
6. Quiet-luxury styling preserved — no stacked modals, no heavy panels. ✅

## Out of scope
- No copy or visual redesign of the cookie banner.
- No changes to FX-rate fetching, currency formatting, or `formatPrice`.
- No deletion of `LocationConsentPrompt.tsx` yet (leave dormant; remove in a cleanup pass once you've confirmed).

## Verification
1. Fresh browser (clear localStorage) → only cookie banner appears; no region popup; footer/header show "Shipping to {detected country} — {CCY} ⌄".
2. Accept or dismiss cookies → no second prompt appears.
3. Reload → no prompts; region badge still reflects the saved region.
4. Click the badge → existing `RegionSelector` opens; changing region updates the badge live and persists across reloads.
5. Footer region selector still works unchanged.
