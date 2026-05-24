# Why the site looks like it won't load

The home page does render — confirmed via browser screenshot after ~4s. What the user perceives as a "white screen" is two stacked render gates that block the home route specifically:

1. **`MaintenanceGate`** returns a blank `<div className="min-h-screen bg-background" />` until either the Supabase `site_settings` fetch resolves (~500–600ms here, can be longer cold) or its 1.5s safety timeout fires. During that window the screen is just the cream background — no logo, no content. This is the first ~0.5–1.5s.

2. **`Suspense` around the lazy `Index` route** holds the pulsing "RUVTIER" wordmark until `src/pages/Index.tsx` + its transitive imports (hero image, editorial assets, brand.ts, hooks, i18n, supabase client) finish streaming. In Vite dev that's ~60+ module requests; on the published bundle it's smaller but still adds a Suspense round-trip the user doesn't need on the most-visited page.

3. Compounding: `Index.tsx` imports several large image assets at module scope, so the chunk only resolves once those are in the browser cache.

Network/log check confirms: no failed requests, no console errors, Vite healthy. Pure perceived-perf problem.

## Plan

All changes are loader/structural only. No visible UI, copy, route, or component changes.

### 1. Eager-load `Index` in `src/App.tsx`
- Replace `const Index = lazy(() => import("./pages/Index"))` with a static `import Index from "./pages/Index"`.
- Leave every other route lazy. Home is the dominant entry point and the only one whose Suspense gap users routinely see.
- Net effect: removes one Suspense fallback frame on `/`.

### 2. Render `MaintenanceGate` optimistically in `src/components/MaintenanceGate.tsx`
- Initialise `settings` to `DEFAULTS` (maintenance OFF) and `loading = false`.
- Keep the Supabase fetch + realtime subscription — they only need to *upgrade* state to the maintenance page if `maintenance_enabled` comes back true.
- Remove the `if (loading) return <div className="min-h-screen bg-background" />` short-circuit.
- Risk: if maintenance is on, the public page may flash for ~500ms before the gate swaps to `MaintenancePage`. Acceptable trade because (a) maintenance mode is rare, (b) admins use `?preview=1` anyway, and (c) the current behaviour penalises every visitor on every load.

### 3. Drop the `Suspense` work for above-the-fold images
- In `src/pages/Index.tsx`, keep the hero `<img>` eager (`fetchpriority="high"`, `decoding="async"`).
- Add `loading="lazy" decoding="async"` to the editorial / "In Your Keeping" / Material grid `<img>` tags that sit below the first viewport. This shrinks what the home chunk waits on before paint.
- No layout changes — existing width/height/aspect classes stay.

### 4. Verify
- Reload `/` in the browser tool, screenshot at ~500ms and ~1500ms. Expected: navigation header + hero copy visible by the first capture instead of the cream/pulse screen.
- Confirm `/admin-prefix` routes and `?preview=1` still resolve.
- Confirm maintenance mode still gates the public site when toggled (toggle via admin or by reading `site_settings`).

## Out of scope
- No Tailwind / design token changes.
- No edits in `src/admin/**` or `src/editor/**`.
- No dependency adds, no route changes, no Supabase schema changes.
- No changes to brand copy or `src/content/*`.

## Files touched
- `src/App.tsx` — eager import for `Index`, fallback unchanged.
- `src/components/MaintenanceGate.tsx` — optimistic initial state, remove blank loading return.
- `src/pages/Index.tsx` — add `loading="lazy"` / `decoding="async"` to below-the-fold `<img>` tags only.
