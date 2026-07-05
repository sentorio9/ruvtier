
CREATE OR REPLACE FUNCTION public.adjust_variant_stock(
  p_variant_id uuid,
  p_change_qty integer,
  p_movement_type text,
  p_reason text DEFAULT NULL,
  p_note text DEFAULT NULL
)
RETURNS public.stock_movements
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev integer;
  v_new integer;
  v_product uuid;
  v_row public.stock_movements;
BEGIN
  IF NOT public.is_editor_or_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not_authorised';
  END IF;

  IF p_movement_type NOT IN (
    'stock_added','stock_removed','manual_adjustment','reserved',
    'reservation_released','sold','returned','damaged','correction'
  ) THEN
    RAISE EXCEPTION 'invalid_movement_type';
  END IF;

  SELECT stock_quantity, product_id INTO v_prev, v_product
  FROM public.product_variants
  WHERE id = p_variant_id
  FOR UPDATE;

  IF v_prev IS NULL THEN
    RAISE EXCEPTION 'variant_not_found';
  END IF;

  v_new := v_prev + p_change_qty;
  IF v_new < 0 THEN
    RAISE EXCEPTION 'negative_stock';
  END IF;

  UPDATE public.product_variants
  SET stock_quantity = v_new, updated_at = now()
  WHERE id = p_variant_id;

  INSERT INTO public.stock_movements (
    variant_id, product_id, change_quantity, movement_type,
    reason, previous_quantity, new_quantity, note, created_by
  ) VALUES (
    p_variant_id, v_product, p_change_qty, p_movement_type,
    p_reason, v_prev, v_new, p_note, auth.uid()
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_variant_stock(uuid, integer, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.adjust_variant_stock(uuid, integer, text, text, text) TO authenticated;
