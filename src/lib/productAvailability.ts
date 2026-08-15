// Public availability helper. Prefers variant-level stock when variants exist,
// otherwise falls back to the product-level fields already in use.
// Kept intentionally small — does not change site copy or layout.

export type AvailabilityState =
  | "purchasable"      // has stock, ready for Stripe checkout when enabled
  | "preorder"         // preorder_enabled at product level
  | "by_allocation"    // waitlist / allocation request only
  | "coming_soon"
  | "sold_out"
  | "unavailable";

interface VariantLike {
  status?: string | null;
  // Exact integers are admin-only. Public callers receive `stock_state`.
  stock_quantity?: number | null;
  reserved_quantity?: number | null;
  stock_state?: string | null;
}

interface ProductLike {
  availability?: string | null;
  preorder_enabled?: boolean | null;
  stock_quantity?: number | null;
  stock_state?: string | null;
}

export function computeAvailability(
  product: ProductLike,
  variants: VariantLike[] = [],
): AvailabilityState {
  const active = variants.filter(v => (v.status ?? "active") === "active");

  if (active.length > 0) {
    const hasStock = active.some(v =>
      v.stock_state
        ? v.stock_state !== "closed"
        : Math.max(0, (v.stock_quantity ?? 0) - (v.reserved_quantity ?? 0)) > 0,
    );
    if (hasStock) return "purchasable";
    if (product.preorder_enabled) return "preorder";
    if (product.availability === "by_allocation") return "by_allocation";
    if (product.availability === "coming_soon") return "coming_soon";
    return "sold_out";
  }

  // No variants defined — fall back to product-level fields (existing behaviour).
  if (product.preorder_enabled) return "preorder";
  const a = (product.availability || "").toString();
  if (a === "purchasable") {
    const inStock = product.stock_state
      ? product.stock_state !== "closed"
      : (product.stock_quantity ?? 0) > 0;
    return inStock ? "purchasable" : "sold_out";
  }
  if (a === "by_allocation") return "by_allocation";
  if (a === "coming_soon") return "coming_soon";
  return "unavailable";
}
