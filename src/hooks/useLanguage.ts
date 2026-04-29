import { useEffect, useState, useCallback } from "react";

const LANG_KEY = "ruvtier_language";

export type LanguageCode = "en" | "fr" | "de" | "it" | "es" | "pt" | "zh-Hant" | "zh-Hans" | "ja" | "ko" | "ar";

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  es: "Español",
  pt: "Português",
  "zh-Hant": "繁體中文",
  "zh-Hans": "简体中文",
  ja: "日本語",
  ko: "한국어",
  ar: "عربي",
};

// Languages offered per ISO country. First entry is the default.
export const COUNTRY_LANGUAGES: Record<string, LanguageCode[]> = {
  AT: ["de", "en"],
  BE: ["fr", "en"],
  BG: ["en"],
  HR: ["en"],
  CY: ["en"],
  CZ: ["en"],
  DK: ["en"],
  EE: ["en"],
  FI: ["en"],
  FR: ["fr", "en"],
  DE: ["de", "en"],
  GR: ["en"],
  HU: ["en"],
  IE: ["en"],
  IT: ["it", "en"],
  LV: ["en"],
  LT: ["en"],
  LU: ["fr", "de", "en"],
  MT: ["en"],
  MC: ["fr", "en"],
  NL: ["en"],
  PL: ["en"],
  PT: ["pt", "en"],
  RO: ["en"],
  SK: ["en"],
  SI: ["en"],
  ES: ["es", "en"],
  SE: ["en"],
  CH: ["de", "fr", "it", "en"],
  UA: ["en"],
  GB: ["en"],
  US: ["en"],
  CA: ["en", "fr"],
  BR: ["pt", "en"],
  MX: ["es", "en"],
  HK: ["en", "zh-Hant"],
  JP: ["ja", "en"],
  KR: ["ko", "en"],
  CN: ["zh-Hans"],
  SG: ["en"],
  AU: ["en"],
  TW: ["zh-Hant", "en"],
  BH: ["en", "ar"],
  KW: ["en", "ar"],
  QA: ["en", "ar"],
  SA: ["en", "ar"],
  AE: ["en", "ar"],
};

export function getDefaultLanguageForCountry(code: string): LanguageCode {
  return COUNTRY_LANGUAGES[code]?.[0] ?? "en";
}

function readStoredLanguage(): LanguageCode | null {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    if (!raw) return null;
    if (raw in LANGUAGE_LABELS) return raw as LanguageCode;
    return null;
  } catch {
    return null;
  }
}

/**
 * Lightweight language store. Persists a single ISO-style language code in
 * localStorage. Wired alongside the region selector so the modal can offer
 * country + language together. Translation pipelines can read this hook later.
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>(() => readStoredLanguage() ?? "en");

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY && e.newValue && e.newValue in LANGUAGE_LABELS) {
        setLanguageState(e.newValue as LanguageCode);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try { localStorage.setItem(LANG_KEY, code); } catch { /* ignore */ }
    // Reflect on the document for downstream tooling.
    try { document.documentElement.lang = code; } catch { /* ignore */ }
  }, []);

  return { language, setLanguage, languageLabel: LANGUAGE_LABELS[language] };
}
