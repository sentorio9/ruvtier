import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export function useActiveProducts(options?: { collection?: string; gender?: string; featured?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ["products", "active", options],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (options?.collection) query = query.eq("collection", options.collection);
      if (options?.gender) query = query.eq("gender_segment", options.gender);
      if (options?.featured) query = query.eq("featured", true);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("status", "active")
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
    enabled: !!slug,
  });
}

export const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "—";
  return `€${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
