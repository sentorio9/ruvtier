import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

// A17/C2 — the public site never asks for internal columns. Exact stock and
// allocation integers are not granted to the anonymous role; the database
// exposes coarse `stock_state` / `allocation_state` signals instead.
export const PUBLIC_PRODUCT_COLUMNS = [
  "id", "name", "slug", "collection", "gender_segment", "description",
  "long_description", "price", "compare_at_price", "sku", "status", "featured",
  "materials", "care_info", "size_options", "color_options", "media_gallery",
  "thumbnail_url", "hero_image_url", "seo_title", "seo_description",
  "created_at", "updated_at", "deleted_at", "preorder_enabled",
  "preorder_statement", "availability", "edition_size",
  "stock_state", "allocation_state",
].join(", ");

export function useActiveProducts(options?: { collection?: string; gender?: string; featured?: boolean; limit?: number }) {
  return useQuery<Product[]>({
    queryKey: ["products", "active", options],
    enabled: isSupabaseConfigured,
    initialData: [],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        console.warn(
          "[useActiveProducts] Supabase not configured — VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing",
        );
        return [];
      }

      let query = supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("status", "active")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (options?.collection) query = query.eq("collection", options.collection);
      if (options?.gender) query = query.eq("gender_segment", options.gender);
      if (options?.featured) query = query.eq("featured", true);
      if (options?.limit) query = query.limit(options.limit);

      const { data, error } = await query;
      if (error) {
        console.error("[useActiveProducts] supabase error", error, { options });
        throw error;
      }
      console.info("[useActiveProducts] result", { count: data?.length ?? 0, options });
      return data as Product[];
    },
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ["product", slug],
    enabled: isSupabaseConfigured && !!slug,
    initialData: null,
    queryFn: async () => {
      if (!isSupabaseConfigured || !slug) return null;
      const { data, error } = await supabase
        .from("products")
        .select(PUBLIC_PRODUCT_COLUMNS)
        .eq("slug", slug)
        .eq("status", "active")
        .is("deleted_at", null)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });
}

// Prices are authored in EUR (base). Displayed in the region-selected
// currency (default GBP) using cached FX rates from localStorage.
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "IDR", "HUF", "CLP", "TWD"]);

export const formatPrice = (price: number | null | undefined): string | null => {
  // Zero or unset prices never render as "£0" — callers should render
  // a Request Allocation CTA instead.
  if (price == null || price <= 0) return null;

  let locale = "en-GB";
  let currency = "GBP";
  let symbol = "£";
  let countryCode = "GB";
  let rate = 1;
  let language = "en";

  try {
    const savedRegion = localStorage.getItem("ruvtier_region");
    if (savedRegion) {
      const r = JSON.parse(savedRegion);
      locale = r.locale || locale;
      currency = r.currency || currency;
      symbol = r.currencySymbol || symbol;
      countryCode = r.countryCode || countryCode;
    }
    const savedLang = localStorage.getItem("ruvtier_language");
    if (savedLang) language = savedLang;

    if (currency !== "EUR") {
      const savedRates = localStorage.getItem("ruvtier_fx_rates_v2");
      if (savedRates) {
        const fx = JSON.parse(savedRates);
        if (fx?.base === "EUR" && typeof fx?.rates?.[currency] === "number") {
          rate = fx.rates[currency];
        }
      }
    }
  } catch { /* keep defaults */ }

  // Always render clean, rounded luxury figures — no decimals, no conversion
  // artefacts like "£2,802.4".
  const converted = price * rate;
  const clean = ZERO_DECIMAL.has(currency)
    ? Math.round(converted / 10) * 10
    : Math.round(converted);

  const candidates = [`${language}-${countryCode}`, language, locale];
  let displayLocale = candidates[0];
  try {
    const LocaleCtor = (Intl as unknown as { Locale?: new (s: string) => unknown }).Locale;
    if (typeof LocaleCtor === "function") {
      for (const c of candidates) {
        try { new LocaleCtor(c); displayLocale = c; break; } catch { /* try next */ }
      }
    }
  } catch { /* ignore */ }

  try {
    return new Intl.NumberFormat(displayLocale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(clean);
  } catch {
    return `${symbol}${clean.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
  }
};

/** Returns a formatted price or the quiet "Request Allocation" fallback
 * when no firm price exists. */
export const priceOrRequest = (price: number | null | undefined): string =>
  formatPrice(price) ?? "Request Allocation";

// Tiny hook: forces a re-render when the region or FX rates change so callers
// that use the static `formatPrice` helper still update live on currency switch.
export function usePriceTick() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener("ruvtier:region-changed", bump);
    window.addEventListener("ruvtier:rates-updated", bump);
    return () => {
      window.removeEventListener("ruvtier:region-changed", bump);
      window.removeEventListener("ruvtier:rates-updated", bump);
    };
  }, []);
}
