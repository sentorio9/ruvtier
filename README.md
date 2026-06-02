# RUVTIER

RUVTIER is a quiet-luxury fashion house. The site is a contemplative,
slow editorial experience devoted to permanence, material origin, and
the art of garment composition. There is no figural logo; the wordmark
stands alone.

- **Tech stack:** Vite, React, TypeScript, Tailwind, shadcn, Supabase.

## For designers / AI agents

If you are working on the brand outside this app, these are the files
to read first:

- [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) - the canonical reference for
  voice, wordmark, color, typography, motion, iconography, and layout.
- [`src/content/brand.ts`](./src/content/brand.ts) - every hard-coded
  piece of marketing copy in one named-export module.
- [`src/content/fixtures.ts`](./src/content/fixtures.ts) - sample
  product records in the house voice, for use when Supabase is
  unreachable.
- [`src/index.css`](./src/index.css) - source of truth for all design
  tokens.
- [`tailwind.config.ts`](./tailwind.config.ts) - Tailwind exposure of
  the tokens above.

## Running locally

Requires Node 18+ and `bun` or `npm`.

```sh
bun install
bun run dev
```

The dev server runs on `http://localhost:5173`.

## Admin Route

The admin panel is mounted from `VITE_ADMIN_ROUTE`. Set it in local and
production environments before building:

```sh
VITE_ADMIN_ROUTE="/change-this-private-admin-route"
```

Do not use `/admin`, `/dashboard`, `/cms`, or `/login`. The public site does
not link to the admin route. All admin pages inject `robots=noindex,nofollow`
and the default private route is blocked in `public/robots.txt`. If the route
is changed in production, update `robots.txt` or generate it at the hosting
layer so it matches the deployed route.

## Supabase Functions

Phase 3 and later admin operations depend on these Edge Functions:

- `admin-login`
- `admin-session`
- `admin-products`
- `admin-upload`
- `auth-email-hook`
- `process-email-queue`

Set Supabase secrets for service-role operations and email sending with
`supabase secrets set`. Never expose `SUPABASE_SERVICE_ROLE_KEY`, Lovable API
keys, or Shopify tokens through Vite client env.

## Shopify Readiness

Supabase remains the source of truth. Product records, options, variants,
images, inventory rows, and `shopify_*` sync fields are structured so Shopify
sync can be added behind the adapter layer without replacing the core catalog.
