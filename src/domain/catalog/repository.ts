import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { mapCatalogProduct } from "./catalogMapper";
import type { CatalogProduct, ProductCatalogFilters } from "./types";

const CATALOG_PRODUCT_SELECT = `
  *,
  product_options(*),
  product_images(*),
  product_variants(*, product_inventory(*))
`;

const catalogClient = supabase as any;

const applyPublicCatalogFilters = (query: any, filters?: ProductCatalogFilters) => {
  let next = query;

  if (filters?.collection) next = next.eq("collection", filters.collection);
  if (filters?.gender) next = next.eq("gender_segment", filters.gender);
  if (filters?.featured) next = next.eq("featured", true);
  if (filters?.limit) next = next.limit(filters.limit);

  return next;
};

const activeProductsQuery = (select: string) =>
  catalogClient
    .from("products")
    .select(select)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

const isNormalizedCatalogUnavailable = (error: unknown) => {
  const source = error as { code?: string; message?: string; details?: string; hint?: string };
  const text = [source.code, source.message, source.details, source.hint]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("pgrst") &&
    (text.includes("schema cache") ||
      text.includes("relationship") ||
      text.includes("product_options") ||
      text.includes("product_variants") ||
      text.includes("product_images") ||
      text.includes("product_inventory"))
  );
};

const fetchLegacyActiveProducts = async (filters?: ProductCatalogFilters) => {
  const query = applyPublicCatalogFilters(activeProductsQuery("*"), filters);
  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(mapCatalogProduct);
};

export const fetchActiveCatalogProducts = async (
  filters?: ProductCatalogFilters,
): Promise<CatalogProduct[]> => {
  if (!isSupabaseConfigured) return [];

  const query = applyPublicCatalogFilters(activeProductsQuery(CATALOG_PRODUCT_SELECT), filters);
  const { data, error } = await query;

  if (error) {
    if (isNormalizedCatalogUnavailable(error)) {
      return fetchLegacyActiveProducts(filters);
    }
    throw error;
  }

  return (data ?? []).map(mapCatalogProduct);
};

const fetchLegacyProductBySlug = async (slug: string) => {
  const { data, error } = await catalogClient
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCatalogProduct(data) : null;
};

export const fetchCatalogProductBySlug = async (
  slug: string | undefined,
): Promise<CatalogProduct | null> => {
  if (!isSupabaseConfigured || !slug) return null;

  const { data, error } = await catalogClient
    .from("products")
    .select(CATALOG_PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    if (isNormalizedCatalogUnavailable(error)) {
      return fetchLegacyProductBySlug(slug);
    }
    throw error;
  }

  return data ? mapCatalogProduct(data) : null;
};
