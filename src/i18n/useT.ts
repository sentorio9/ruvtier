import { useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TRANSLATIONS, type TranslationKey } from "./translations";

/**
 * useT — translation lookup hook for the navigation + footer surfaces.
 * Falls back to English if a key is missing in the active locale.
 */
export function useT() {
  const { language } = useLanguage();
  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = TRANSLATIONS[language] ?? TRANSLATIONS.en;
      return dict[key] ?? TRANSLATIONS.en[key] ?? key;
    },
    [language]
  );
  return { t, language };
}
