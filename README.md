# RUVTIER

RUVTIER is a quiet-luxury fashion house. The site is a contemplative,
slow editorial experience devoted to permanence, material origin, and
the art of garment composition. There is no figural logo — the
wordmark stands alone.

- **Tech stack:** Vite · React · TypeScript · Tailwind · shadcn · Supabase.

## For designers / AI agents

If you are working on the brand outside this app, these are the files
to read first:

- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) — the canonical reference for
  voice, wordmark, color, typography, motion, iconography, and layout.
- [`src/content/brand.ts`](./src/content/brand.ts) — every hard-coded
  piece of marketing copy in one named-export module.
- [`src/content/fixtures.ts`](./src/content/fixtures.ts) — sample
  product records in the house voice, for use when Supabase is
  unreachable.
- [`src/index.css`](./src/index.css) — source of truth for all design
  tokens (colour, type scale, easing, layout).
- [`tailwind.config.ts`](./tailwind.config.ts) — Tailwind exposure of
  the tokens above.

Page files in `src/pages/` and components in `src/components/` carry
header comments describing purpose, section order, and the
design-system pieces they depend on.

## Running locally

Requires Node 18+ and `bun` (or `npm`).

```sh
bun install
bun run dev
```

The dev server runs on `http://localhost:5173`.
