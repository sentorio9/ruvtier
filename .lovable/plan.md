## Goal
Add 3 active, featured products to the catalogue using the 3 uploaded images so the homepage (The Edit / The Icons) has real product data to render. Content matches existing RUVTIER tone in `src/content/fixtures.ts`.

## Steps
1. **Register uploads as Lovable assets** (`src/assets/seed-*.png.asset.json`) via `lovable-assets create` from `/mnt/user-uploads/image-53.png`, `image-54.png`, `image-55.png` — keeps binaries out of the repo, gives stable CDN URLs.
2. **Write a one-off Supabase migration** that inserts 3 rows into `public.products` using those CDN URLs for `hero_image_url` and `thumbnail_url`. All rows: `status='active'`, `featured=true`, `availability` set per item, `stock_quantity=null`, `allocated_count=0`.

## Products
| slug | name | gender | category/collection | price € | availability | preorder |
|---|---|---|---|---|---|---|
| waffle-cashmere-mock-bordeaux | The Waffle Mock — Bordeaux | men | knitwear | 1480 | made_to_measure | false |
| atelier-boiled-wool-shell | Atelier Boiled-Wool Shell | women | knitwear | 1180 | in_store | false |
| ribbed-cashmere-mock-bordeaux | Ribbed Cashmere Mock — Bordeaux | men | knitwear | 1680 | by_allocation | true |

Copy: house voice, materials-as-subject, no marketing adjectives (e.g. "Waffle-stitched in undyed cashmere, knitted on slow-gauge looms in Biella. A weight that holds its line without pressing.").

## Out of scope
No schema changes, no homepage code edits, no admin UI changes. Existing `useActiveProducts({ featured: true })` query will pick these up automatically.
