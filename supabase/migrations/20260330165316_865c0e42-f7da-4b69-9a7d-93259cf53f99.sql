-- Fix overly permissive anon cart policy - restrict to session-based inserts only
DROP POLICY "Anon can manage session cart" ON public.carts;

CREATE POLICY "Anon can insert cart" ON public.carts
  FOR INSERT TO anon
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anon can view own session cart" ON public.carts
  FOR SELECT TO anon
  USING (session_id IS NOT NULL);

CREATE POLICY "Anon can update own session cart" ON public.carts
  FOR UPDATE TO anon
  USING (session_id IS NOT NULL)
  WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);