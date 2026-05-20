## Problem

You're seeing a perpetual loading spinner, but the site loads cleanly on my end:

- Preview URL: returns the hero, headline, and Pre-Order CTAs within ~1s
- Published site (`ruvtier.com`): returns HTTP 200
- Lovable Cloud backend: healthy
- `site_settings.maintenance_enabled`: false
- No runtime errors; only harmless React Router v7 future-flag warnings

That points to either a **stale preview iframe / cached service worker on your device**, or a **gating component that never resolves on slower networks**. The most likely code-side culprit is `MaintenanceGate` — it blocks the whole app behind a Supabase query and renders a blank `min-h-screen` div until it resolves. If that query hangs (slow network, blocked request), the app appears to spin forever with no fallback.

## Quick check first (no code change)

1. Hard-refresh the preview: `Ctrl/Cmd + Shift + R`
2. Open the preview in an incognito window
3. Try the published URL: https://ruvtier.com

If any of those load instantly, it's a local cache issue and no code change is needed.

## Plan — if it still hangs

Harden the boot path so a single slow network call can never freeze the entire site.

### 1. `src/components/MaintenanceGate.tsx`
- Add a **1500ms safety timeout** to the initial settings fetch. If the query hasn't resolved by then, fall through with `DEFAULTS` (maintenance off) and continue rendering the app. Realtime subscription still updates `settings` afterwards.
- Wrap the Supabase call in `try/catch` so a thrown error never leaves `loading=true` forever.

### 2. `src/App.tsx` (Suspense fallback)
- Replace the blank `<div className="min-h-screen bg-background" />` with a minimal **brand-consistent shimmer** (off-white field + tiny centered RUVTIER wordmark at 40% opacity). Same behavior, but the user sees that something is happening instead of guessing.

### 3. `src/hooks/useRegionCurrency.tsx` (light audit)
- Confirm it doesn't block first paint on a slow external IP-geo / FX call. If it does, defer those fetches behind `useEffect` with `AbortController` and a 2s timeout — never gate render on them.

## Files to touch
- `src/components/MaintenanceGate.tsx` — add timeout + try/catch
- `src/App.tsx` — replace Suspense fallback with branded shimmer
- `src/hooks/useRegionCurrency.tsx` — audit only; edit only if it blocks render

## Out of scope
- No design changes to the hero or any other section.
- No backend / schema / RLS changes.
- No new dependencies.