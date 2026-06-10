## Goal
Make The Edit and The Icons resilient on the published site: never hide silently, log Supabase data/errors, and confirm env-var wiring is production-safe.

## Changes

### 1. `src/hooks/useProducts.tsx` — surface errors + log
- Update `useActiveProducts` to no longer swallow the React Query `error`. Inside `queryFn`, `console.error("[useActiveProducts] supabase error", error, { options })` before throwing, and `console.info("[useActiveProducts] result", { count: data?.length, options })` on success.
- Also log a single `console.warn("[useActiveProducts] Supabase not configured — VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing")` when `isSupabaseConfigured` is false (the early `return []` currently hides this).
- Return the query result unchanged so callers can read `error` if needed.

### 2. `src/pages/Index.tsx` — fail-visible
- Destructure `error` and `isLoading` from `useActiveProducts`.
- Add a `useEffect` that logs `{ data: featuredProducts, error, isSupabaseConfigured }` on mount/whenever they change so it appears in the live site console.
- Remove the `{editProducts.length > 0 && (...)}` gate around The Edit (line 281 / 346). Always render the section shell (eyebrow + headline + "View all" link). Inside the grid, render one of three states:
  - loading skeleton (4 empty `aspect-[3/4] bg-secondary` tiles),
  - error notice (`console.error` already emitted; show a small muted "Selection temporarily unavailable" line so the failure is visible), or
  - the product cards.

### 3. `src/components/home/TheIcons.tsx` — fail-visible
- Remove the `if (!products || products.length < 1) return null;` early return.
- Always render the shell. When `products` is empty, render 3 placeholder tiles + the same muted "Selection temporarily unavailable" caption used in The Edit.
- Component stays a pure presentational receiver — Index owns the fetch and the console logging.

### 4. Supabase client env-var sanity check (no code change expected)
- `src/integrations/supabase/client.ts` already reads `import.meta.env.VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`, warns when missing, and falls back to a placeholder so the module is import-safe.
- `.env.example` already lists both keys. No hardcoded preview-only values exist.
- The plan therefore only adds a one-line `console.info` at module load time in `client.ts` reporting `{ isSupabaseConfigured, url: SUPABASE_URL ? "set" : "missing", key: SUPABASE_PUBLISHABLE_KEY ? "set" : "missing" }` (no secret values logged) so the live console clearly shows whether the production build received the env vars. If this turns out to be missing in production, the fix is to set the two `VITE_*` vars in the deployment environment — code can't recover from absent env vars.

## Out of scope
- No DB / RLS / GRANT changes (Index reads `products` via the existing `useActiveProducts` hook; if the issue is RLS-related the new console logs will surface the exact PostgREST error so we can address it in a follow-up).
- No visual redesign of the sections; placeholders reuse existing tokens (`bg-secondary`, `text-muted-foreground`, `type-eyebrow`).

## Verification
1. In preview: sections render as today (data present); console shows `[useActiveProducts] result { count: N }`.
2. Temporarily break the query (e.g. filter on impossible value) → sections still render with placeholders + console.error.
3. On the published site: open devtools console, confirm either the success log or a clear error message, and confirm The Edit / The Icons shells are visible.
