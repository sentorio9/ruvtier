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

// ─── Cross-component reactive store ───────────────────────────────────────
// useState is local to each component, so calling setLanguage in one place
// (e.g. the modal) wouldn't re-render the footer or nav. We back the hook
// with a tiny pub/sub so every consumer subscribes to the same source of
// truth and updates instantly — no provider, no refresh.

let currentLanguage: LanguageCode = (() => {
  if (typeof window === "undefined") return "en";
  return readStoredLanguage() ?? "en";
})();

const listeners = new Set<(lang: LanguageCode) => void>();

function emit(lang: LanguageCode) {
  currentLanguage = lang;
  listeners.forEach((l) => l(lang));
}

export function setLanguageGlobal(code: LanguageCode) {
  if (!(code in LANGUAGE_LABELS)) return;
  try { localStorage.setItem(LANG_KEY, code); } catch { /* ignore */ }
  try { document.documentElement.lang = code; } catch { /* ignore */ }
  emit(code);
}

if (typeof window !== "undefined") {
  // Sync across browser tabs / external writes.
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === LANG_KEY && e.newValue && e.newValue in LANGUAGE_LABELS) {
      emit(e.newValue as LanguageCode);
    }
  });
  // Reflect initial value on <html lang>.
  try { document.documentElement.lang = currentLanguage; } catch { /* ignore */ }
}

/**
 * Subscribe to the global language store. Every consumer re-renders the
 * moment any other consumer (or the modal) calls `setLanguage`.
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>(currentLanguage);

  useEffect(() => {
    // Catch any change that happened between module load and mount.
    if (currentLanguage !== language) setLanguageState(currentLanguage);
    const listener = (lang: LanguageCode) => setLanguageState(lang);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageGlobal(code);
  }, []);

  return { language, setLanguage, languageLabel: LANGUAGE_LABELS[language] };
}

