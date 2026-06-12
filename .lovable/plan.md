## Diagnosis

Confirmed via DB inspection: `public.products` has four PERMISSIVE policies:

1. `Public can view active products` — anon, SELECT, `status='active' AND deleted_at IS NULL`
2. `Authenticated can view active products` — authenticated, SELECT, same predicate
3. `Admins can manage products` — authenticated, **FOR ALL**, `is_admin(auth.uid())`
4. `Editors can manage products` — authenticated, **FOR ALL**, `is_editor_or_admin(auth.uid())`

Grants and the public-read policy are correct (and the anon request from the live site returns all six featured products, matching what you saw when logged out).

The `FOR ALL` policies cover SELECT as well as writes. They're PERMISSIVE so in normal PostgREST evaluation they should OR with the read policy. But the symptom — empty result for authenticated users, full result for anon — is the classic shape of a `FOR ALL` management policy interfering with reads (e.g. PostgREST/PostgreSQL refusing to short-circuit when a permissive qual on a logged-in session evaluates in an unexpected way, or a stale plan cache after the recent grants migration). The cleanest, future-proof fix is to keep the management policies off the SELECT path entirely.

## Plan

Add one migration that, for `products` (and the parallel pattern on a few other public-read tables), replaces the `FOR ALL` admin/editor policies with explicit `FOR INSERT`, `FOR UPDATE`, `FOR DELETE` policies. The read path is then driven solely by the two SELECT policies that already work for anon.

### Migration sketch

```sql
-- products
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Editors can manage products" ON public.products;

CREATE POLICY "Editors can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Editors can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin(auth.uid()))
  WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
```

Same treatment applied to `site_content` and `site_settings` if they show the same `FOR ALL` admin policy (will verify in build mode before writing the SQL).

### Verification

1. Run the migration.
2. With `supabase--read_query` simulate as authenticated: confirm SELECT returns the six featured rows.
3. Reload the preview while signed in to the Client Lounge and confirm The Edit / The Icons populate.
4. Confirm admin panel can still create / edit / delete products.

No client code changes; no schema changes; no impact on anon visitors.
