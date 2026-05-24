import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products">;

export function useActiveProducts(options?: { collection?: string; gender?: string; featured?: boolean; limit?: number }) {
  return useQuery<Product[]>({
    queryKey: ["products", "active", options],
    enabled: isSupabaseConfigured,
    initialData: [],
    queryFn: async () => {
      if (!isSupabaseConfigured) return [];

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
  return useQuery<Product | null>({
    queryKey: ["product", slug],
    enabled: isSupabaseConfigured && !!slug,
    initialData: null,
    queryFn: async () => {
      if (!isSupabaseConfigured || !slug) return null;
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
  });
}

// Prices are authored in EUR (base). This static helper reads the active region
// AND the cached FX rates from localStorage so non-React contexts can display
// the converted, market-priced amount. Components that need to re-render on
// currency change should additionally subscribe via `useRegionCurrency()` or
// the `usePriceTick()` hook below.
const ZERO_DECIMAL = new Set(["JPY", "KRW", "VND", "IDR", "HUF", "CLP", "TWD"]);

export const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "—";

  let locale = "fr-FR";
  let currency = "EUR";
  let symbol = "€";
  let countryCode = "FR";
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
      // Use the v2 cache key written by useRegionCurrency.
      const savedRates = localStorage.getItem("ruvtier_fx_rates_v2");
      if (savedRates) {
        const fx = JSON.parse(savedRates);
        if (fx?.base === "EUR" && typeof fx?.rates?.[currency] === "number") {
          rate = fx.rates[currency];
        }
      }
    }
  } catch { /* keep defaults */ }

  if (price === 0) return `${symbol}0`;

  // Combine UI language with country for natural formatting (e.g. "en-FR").
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

  const converted = price * rate;
  const zd = ZERO_DECIMAL.has(currency);
  try {
    return new Intl.NumberFormat(displayLocale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: zd ? 0 : 2,
    }).format(converted);
  } catch {
    return `${symbol}${(zd ? Math.round(converted) : converted).toLocaleString("en-US", { maximumFractionDigits: zd ? 0 : 2 })}`;
  }
};

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
