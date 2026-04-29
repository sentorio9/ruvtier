import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";

export interface RegionConfig {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  locale: string;
}

const REGION_KEY = "ruvtier_region";
// Bumped cache key to invalidate any stale/empty rate caches written by the
// previous (now key-protected) exchangerate.host endpoint.
const RATES_KEY = "ruvtier_fx_rates_v2";
const CONSENT_KEY = "ruvtier_location_consent";
const RATES_TTL_MS = 60 * 60 * 1000; // 1h
// Prices are authored in EUR — this is the base currency for FX conversion.
const BASE_CURRENCY = "EUR";

const CURRENCY_MAP: Record<string, { currency: string; symbol: string; locale: string }> = {
  US: { currency: "USD", symbol: "$", locale: "en-US" },
  GB: { currency: "GBP", symbol: "£", locale: "en-GB" },
  FR: { currency: "EUR", symbol: "€", locale: "fr-FR" },
  DE: { currency: "EUR", symbol: "€", locale: "de-DE" },
  IT: { currency: "EUR", symbol: "€", locale: "it-IT" },
  ES: { currency: "EUR", symbol: "€", locale: "es-ES" },
  NL: { currency: "EUR", symbol: "€", locale: "nl-NL" },
  BE: { currency: "EUR", symbol: "€", locale: "fr-BE" },
  AT: { currency: "EUR", symbol: "€", locale: "de-AT" },
  PT: { currency: "EUR", symbol: "€", locale: "pt-PT" },
  IE: { currency: "EUR", symbol: "€", locale: "en-IE" },
  FI: { currency: "EUR", symbol: "€", locale: "fi-FI" },
  GR: { currency: "EUR", symbol: "€", locale: "el-GR" },
  JP: { currency: "JPY", symbol: "¥", locale: "ja-JP" },
  CN: { currency: "CNY", symbol: "¥", locale: "zh-CN" },
  KR: { currency: "KRW", symbol: "₩", locale: "ko-KR" },
  AE: { currency: "AED", symbol: "د.إ", locale: "ar-AE" },
  SA: { currency: "SAR", symbol: "﷼", locale: "ar-SA" },
  AU: { currency: "AUD", symbol: "A$", locale: "en-AU" },
  CA: { currency: "CAD", symbol: "C$", locale: "en-CA" },
  CH: { currency: "CHF", symbol: "CHF", locale: "de-CH" },
  SE: { currency: "SEK", symbol: "kr", locale: "sv-SE" },
  DK: { currency: "DKK", symbol: "kr", locale: "da-DK" },
  NO: { currency: "NOK", symbol: "kr", locale: "nb-NO" },
  IN: { currency: "INR", symbol: "₹", locale: "en-IN" },
  BR: { currency: "BRL", symbol: "R$", locale: "pt-BR" },
  MX: { currency: "MXN", symbol: "$", locale: "es-MX" },
  RU: { currency: "RUB", symbol: "₽", locale: "ru-RU" },
  TR: { currency: "TRY", symbol: "₺", locale: "tr-TR" },
  PL: { currency: "PLN", symbol: "zł", locale: "pl-PL" },
  CZ: { currency: "CZK", symbol: "Kč", locale: "cs-CZ" },
  HU: { currency: "HUF", symbol: "Ft", locale: "hu-HU" },
  ZA: { currency: "ZAR", symbol: "R", locale: "en-ZA" },
  SG: { currency: "SGD", symbol: "S$", locale: "en-SG" },
  HK: { currency: "HKD", symbol: "HK$", locale: "zh-HK" },
  TW: { currency: "TWD", symbol: "NT$", locale: "zh-TW" },
  MY: { currency: "MYR", symbol: "RM", locale: "ms-MY" },
  TH: { currency: "THB", symbol: "฿", locale: "th-TH" },
  ID: { currency: "IDR", symbol: "Rp", locale: "id-ID" },
  PH: { currency: "PHP", symbol: "₱", locale: "fil-PH" },
  VN: { currency: "VND", symbol: "₫", locale: "vi-VN" },
  NG: { currency: "NGN", symbol: "₦", locale: "en-NG" },
  EG: { currency: "EGP", symbol: "E£", locale: "ar-EG" },
  KW: { currency: "KWD", symbol: "د.ك", locale: "ar-KW" },
  QA: { currency: "QAR", symbol: "﷼", locale: "ar-QA" },
  BH: { currency: "BHD", symbol: "BD", locale: "ar-BH" },
  OM: { currency: "OMR", symbol: "﷼", locale: "ar-OM" },
};

const DEFAULT_REGION: RegionConfig = {
  country: "France",
  countryCode: "FR",
  currency: "EUR",
  currencySymbol: "€",
  locale: "fr-FR",
};

export const REGIONS: { code: string; name: string; currency: string; symbol: string }[] = [
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
  { code: "IT", name: "Italy", currency: "EUR", symbol: "€" },
  { code: "ES", name: "Spain", currency: "EUR", symbol: "€" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "د.إ" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", symbol: "﷼" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "CHF" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "SE", name: "Sweden", currency: "SEK", symbol: "kr" },
  { code: "NO", name: "Norway", currency: "NOK", symbol: "kr" },
  { code: "DK", name: "Denmark", currency: "DKK", symbol: "kr" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "HK", name: "Hong Kong", currency: "HKD", symbol: "HK$" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "₺" },
];

interface FxCache {
  base: string;
  fetchedAt: number;
  rates: Record<string, number>;
}

interface RegionContextValue {
  region: RegionConfig;
  setRegion: (code: string) => void;
  formatPrice: (amountInBase: number) => string;
  convert: (amountInBase: number) => number;
  rate: number;
  ratesUpdatedAt: number | null;
  refreshing: boolean;
  refreshRates: () => Promise<void>;
  needsLocationConsent: boolean;
  acceptLocationConsent: () => Promise<void>;
  dismissLocationConsent: () => void;
  loading: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

function getRegionFromCode(code: string): RegionConfig {
  const r = REGIONS.find((r) => r.code === code);
  const cm = CURRENCY_MAP[code];
  if (cm) {
    return {
      country: r?.name ?? code,
      countryCode: code,
      currency: cm.currency,
      currencySymbol: cm.symbol,
      locale: cm.locale,
    };
  }
  return { ...DEFAULT_REGION, countryCode: code };
}

function readCachedRates(): FxCache | null {
  try {
    const raw = localStorage.getItem(RATES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FxCache;
    if (parsed.base !== BASE_CURRENCY) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function fetchRates(): Promise<FxCache | null> {
  // Free, no-key endpoints. Ordered by reliability.
  // Note: api.exchangerate.host now requires an access key and returns 200 OK
  // with `success:false` and no `rates`, so it's intentionally excluded.
  const endpoints = [
    `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`,
    `https://cdn.jsdelivr.net/npm/@fawazahmed/currency-api@latest/v1/currencies/${BASE_CURRENCY.toLowerCase()}.json`,
    `https://latest.currency-api.pages.dev/v1/currencies/${BASE_CURRENCY.toLowerCase()}.json`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = await res.json();
      // open.er-api.com → { rates: { USD: 1.17, ... } }
      // currency-api    → { eur: { usd: 1.17, ... } }
      let rates: Record<string, number> | undefined = json?.rates;
      if (!rates) {
        const inner = json?.[BASE_CURRENCY.toLowerCase()];
        if (inner && typeof inner === "object") {
          rates = {};
          for (const [k, v] of Object.entries(inner)) {
            if (typeof v === "number") rates[k.toUpperCase()] = v;
          }
        }
      }
      if (rates && typeof rates === "object" && Object.keys(rates).length > 5) {
        const cache: FxCache = { base: BASE_CURRENCY, fetchedAt: Date.now(), rates };
        try { localStorage.setItem(RATES_KEY, JSON.stringify(cache)); } catch { /* ignore quota */ }
        return cache;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionConfig>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);
  const [fx, setFx] = useState<FxCache | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [needsLocationConsent, setNeedsLocationConsent] = useState(false);
  const initialized = useRef(false);

  // Persist region + broadcast so static helpers (outside React) can react.
  const persistRegion = (r: RegionConfig) => {
    try { localStorage.setItem(REGION_KEY, JSON.stringify(r)); } catch { /* ignore */ }
    try { window.dispatchEvent(new CustomEvent("ruvtier:region-changed", { detail: r })); } catch { /* ignore */ }
  };

  const ensureFreshRates = useCallback(async (force = false) => {
    const cached = readCachedRates();
    const stale = !cached || Date.now() - cached.fetchedAt > RATES_TTL_MS;
    if (cached && !stale && !force) {
      setFx(cached);
      return cached;
    }
    setRefreshing(true);
    const next = await fetchRates();
    if (next) setFx(next);
    else if (cached) setFx(cached); // fall back to stale cache
    setRefreshing(false);
    return next ?? cached;
  }, []);

  const refreshRates = useCallback(async () => {
    await ensureFreshRates(true);
    try { window.dispatchEvent(new CustomEvent("ruvtier:rates-updated")); } catch { /* ignore */ }
  }, [ensureFreshRates]);

  // Initial mount: restore region, decide on consent, prime rates.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const saved = localStorage.getItem(REGION_KEY);
    const consent = localStorage.getItem(CONSENT_KEY);
    let restored: RegionConfig | null = null;
    if (saved) {
      try { restored = JSON.parse(saved); } catch { /* ignore */ }
    }

    if (restored) {
      setRegionState(restored);
    } else {
      // No saved region: fall back to timezone immediately, but ask for consent for IP-based precision.
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const lang = navigator.language || "en";
        const code = detectCountryFromTimezone(tz, lang);
        const r = getRegionFromCode(code);
        setRegionState(r);
        persistRegion(r);
      } catch { /* keep default */ }
    }

    if (!consent && !restored) setNeedsLocationConsent(true);

    setLoading(false);
    // Prime FX rates in the background.
    ensureFreshRates(false);
  }, [ensureFreshRates]);

  const setRegion = useCallback(
    (code: string) => {
      const r = getRegionFromCode(code);
      persistRegion(r);
      // Refresh rates first so the reloaded page shows accurate market prices,
      // then perform a full reload so every price/format updates instantly.
      (async () => {
        try { await ensureFreshRates(true); } catch { /* ignore */ }
        try { window.dispatchEvent(new CustomEvent("ruvtier:rates-updated")); } catch { /* ignore */ }
        setRegionState(r);
        try { window.location.reload(); } catch { /* ignore */ }
      })();
    },
    [ensureFreshRates]
  );

  const acceptLocationConsent = useCallback(async () => {
    try { localStorage.setItem(CONSENT_KEY, "granted"); } catch { /* ignore */ }
    setNeedsLocationConsent(false);
    try {
      const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const code: string | undefined = json?.country_code;
        if (code && CURRENCY_MAP[code]) {
          const r = getRegionFromCode(code);
          setRegionState(r);
          persistRegion(r);
          ensureFreshRates(true);
        }
      }
    } catch {
      // Non-fatal — keep timezone-based region.
    }
  }, [ensureFreshRates]);

  const dismissLocationConsent = useCallback(() => {
    try { localStorage.setItem(CONSENT_KEY, "dismissed"); } catch { /* ignore */ }
    setNeedsLocationConsent(false);
  }, []);

  // If we don't have a rate yet for the selected currency, fall back to EUR (base)
  // rather than silently rendering "10 USD" for €10 — which is what produces the
  // "wrong amount" the user is seeing.
  const hasRate = region.currency === BASE_CURRENCY || typeof fx?.rates?.[region.currency] === "number";
  const rate = hasRate ? (region.currency === BASE_CURRENCY ? 1 : (fx!.rates[region.currency] as number)) : 1;

  const convert = useCallback(
    (amountInBase: number) => {
      if (!hasRate) return amountInBase; // EUR amount
      if (region.currency === BASE_CURRENCY) return amountInBase;
      return amountInBase * rate;
    },
    [region.currency, rate, hasRate]
  );

  const formatPrice = useCallback(
    (amountInBase: number) => {
      const displayCurrency = hasRate ? region.currency : BASE_CURRENCY;
      const displayLocale = hasRate ? region.locale : "fr-FR";
      const converted = convert(amountInBase);
      const zeroDecimal = ["JPY", "KRW", "VND", "IDR", "HUF", "CLP", "TWD"].includes(displayCurrency);
      try {
        return new Intl.NumberFormat(displayLocale, {
          style: "currency",
          currency: displayCurrency,
          minimumFractionDigits: 0,
          maximumFractionDigits: zeroDecimal ? 0 : 2,
        }).format(converted);
      } catch {
        return `${hasRate ? region.currencySymbol : "€"}${Math.round(converted).toLocaleString()}`;
      }
    },
    [region, convert, hasRate]
  );

  return (
    <RegionContext.Provider
      value={{
        region,
        setRegion,
        formatPrice,
        convert,
        rate,
        ratesUpdatedAt: fx?.fetchedAt ?? null,
        refreshing,
        refreshRates,
        needsLocationConsent,
        acceptLocationConsent,
        dismissLocationConsent,
        loading,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionCurrency() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegionCurrency must be used within RegionProvider");
  return ctx;
}

function detectCountryFromTimezone(tz: string, lang: string): string {
  const tzMap: Record<string, string> = {
    "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US",
    "America/Los_Angeles": "US", "America/Phoenix": "US",
    "Europe/London": "GB", "Europe/Paris": "FR", "Europe/Berlin": "DE",
    "Europe/Rome": "IT", "Europe/Madrid": "ES", "Europe/Amsterdam": "NL",
    "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Lisbon": "PT",
    "Europe/Dublin": "IE", "Europe/Helsinki": "FI", "Europe/Athens": "GR",
    "Europe/Stockholm": "SE", "Europe/Oslo": "NO", "Europe/Copenhagen": "DK",
    "Europe/Zurich": "CH", "Europe/Warsaw": "PL", "Europe/Prague": "CZ",
    "Europe/Budapest": "HU", "Europe/Istanbul": "TR", "Europe/Moscow": "RU",
    "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK",
    "Asia/Seoul": "KR", "Asia/Singapore": "SG", "Asia/Taipei": "TW",
    "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Kuwait": "KW",
    "Asia/Qatar": "QA", "Asia/Bahrain": "BH", "Asia/Muscat": "OM",
    "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
    "Asia/Bangkok": "TH", "Asia/Jakarta": "ID", "Asia/Manila": "PH",
    "Asia/Ho_Chi_Minh": "VN", "Asia/Kuala_Lumpur": "MY",
    "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
    "America/Toronto": "CA", "America/Vancouver": "CA",
    "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
    "Africa/Cairo": "EG", "Africa/Lagos": "NG", "Africa/Johannesburg": "ZA",
  };

  if (tzMap[tz]) return tzMap[tz];

  const parts = lang.split("-");
  if (parts.length > 1) {
    const code = parts[1].toUpperCase();
    if (CURRENCY_MAP[code]) return code;
  }

  return "FR";
}
