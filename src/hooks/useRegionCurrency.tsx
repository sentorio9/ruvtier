import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export interface RegionConfig {
  country: string;
  countryCode: string;
  currency: string;
  currencySymbol: string;
  locale: string;
}

const REGION_KEY = "ruvtier_region";

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

interface RegionContextValue {
  region: RegionConfig;
  setRegion: (code: string) => void;
  formatPrice: (amount: number) => string;
  loading: boolean;
}

const RegionContext = createContext<RegionContextValue | null>(null);

function getRegionFromCode(code: string): RegionConfig {
  const r = REGIONS.find((r) => r.code === code);
  const cm = CURRENCY_MAP[code];
  if (r && cm) {
    return { country: r.name, countryCode: code, currency: cm.currency, currencySymbol: cm.symbol, locale: cm.locale };
  }
  return { ...DEFAULT_REGION, countryCode: code };
}

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<RegionConfig>(DEFAULT_REGION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(REGION_KEY);
    if (saved) {
      try {
        setRegionState(JSON.parse(saved));
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang = navigator.language || "en";
      const countryCode = detectCountryFromTimezone(tz, lang);
      const detected = getRegionFromCode(countryCode);
      setRegionState(detected);
      localStorage.setItem(REGION_KEY, JSON.stringify(detected));
    } catch {
      // Keep default
    }
    setLoading(false);
  }, []);

  const setRegion = useCallback((code: string) => {
    const r = getRegionFromCode(code);
    setRegionState(r);
    localStorage.setItem(REGION_KEY, JSON.stringify(r));
  }, []);

  const formatPrice = useCallback(
    (amount: number) => {
      try {
        return new Intl.NumberFormat(region.locale, {
          style: "currency",
          currency: region.currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `${region.currencySymbol}${amount}`;
      }
    },
    [region]
  );

  return (
    <RegionContext.Provider value={{ region, setRegion, formatPrice, loading }}>
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
