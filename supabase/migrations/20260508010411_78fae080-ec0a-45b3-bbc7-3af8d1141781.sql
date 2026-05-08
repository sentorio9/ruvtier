
-- Tighten anonymous cart access: cart persistence is not currently used client-side,
-- so revoke anon read/write entirely. Only admins manage carts; authenticated users
-- continue to manage their own cart via the existing user_id policy.
DROP POLICY IF EXISTS "Anon can view own session cart" ON public.carts;
DROP POLICY IF EXISTS "Anon can update own session cart" ON public.carts;
DROP POLICY IF EXISTS "Anon can insert cart" ON public.carts;

-- Defense-in-depth on user_roles: add a restrictive policy so only super_admins can
-- insert/update/delete role rows, even if a future permissive policy is added.
DROP POLICY IF EXISTS "Restrict role writes to super admins" ON public.user_roles;
CREATE POLICY "Restrict role writes to super admins"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO authenticated, anon
USING (public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));
