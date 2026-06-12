# Fix: Collections empty on the live site

## Diagnosis

- The 6 active products (Silk Meridian Blazer, Cashmere shirt, Theia Sweater, Atelier Boiled-Wool Shell, and the two Bordeaux mocks) **are in the database** and registered in the admin panel — nothing is missing there.
- The access policies (who may read what) are all correctly defined.
- However, **every table in the database is missing its base Data API permissions (GRANTs)**. Policies alone aren't enough — without an explicit grant, the database refuses the request outright, so the website receives "permission denied" and shows "Selection coming soon" / "Selection temporarily unavailable".
- This affects the published site and (once caches clear) the preview too, plus other features: pre-order requests, the maintenance subscribe form, site content/settings, the admin panel's data, and backend functions.

## Fix (one database migration, no code changes)

Add the missing grants, matched to the existing policies:

1. **All tables** — full access for the backend service role (used by admin functions and email processing).
2. **All tables** — read/write access for signed-in users (still filtered by the existing row-level policies, so nothing becomes more permissive than the policies allow).
3. **Anonymous visitors** — only what the policies already permit:
   - Read: `products`, `site_content`, `site_settings`
   - Submit: `preorder_requests` (private access requests), `maintenance_subscribers` (newsletter)

## Technical details

```sql
-- per public table:
GRANT ALL ON public.<table> TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table> TO authenticated;
-- anon, scoped to existing policies:
GRANT SELECT ON public.products, public.site_content, public.site_settings TO anon;
GRANT INSERT ON public.preorder_requests, public.maintenance_subscribers TO anon;
```

Row-level security stays untouched — grants only make the tables reachable; the existing policies keep controlling which rows are visible.

## Verification

After the migration, reload the published site and confirm "The Edit" and "The Icons" render the products.