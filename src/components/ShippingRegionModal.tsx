import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegionCurrency, REGIONS } from "@/hooks/useRegionCurrency";

interface ShippingRegionModalProps {
  open: boolean;
  onClose: () => void;
}

// Group ISO country codes by editorial region. We render a label per locale
// (e.g. "Italy (Italian)") even when several point to the same ISO code,
// matching the editorial reference provided by the user.
type Entry = { code: string; label: string };

const EUROPE: Entry[] = [
  { code: "AT", label: "Österreich (Deutsch)" },
  { code: "AT", label: "Austria (English)" },
  { code: "BE", label: "Belgique (Français)" },
  { code: "BE", label: "Belgium (English)" },
  { code: "BG", label: "Bulgaria (English)" },
  { code: "HR", label: "Croatia (English)" },
  { code: "CY", label: "Cyprus (English)" },
  { code: "CZ", label: "Czech Republic (English)" },
  { code: "DK", label: "Denmark (English)" },
  { code: "EE", label: "Estonia (English)" },
  { code: "FI", label: "Finland (English)" },
  { code: "FR", label: "France (Français)" },
  { code: "FR", label: "France (English)" },
  { code: "DE", label: "Deutschland (Deutsch)" },
  { code: "DE", label: "Germany (English)" },
  { code: "GR", label: "Greece (English)" },
  { code: "HU", label: "Hungary (English)" },
  { code: "IE", label: "Ireland (English)" },
  { code: "IT", label: "Italia (Italiano)" },
  { code: "IT", label: "Italy (English)" },
  { code: "LV", label: "Latvia (English)" },
  { code: "LT", label: "Lithuania (English)" },
  { code: "LU", label: "Luxembourg (Français)" },
  { code: "LU", label: "Luxemburg (Deutsch)" },
  { code: "LU", label: "Luxembourg (English)" },
  { code: "MT", label: "Malta (English)" },
  { code: "MC", label: "Monaco (Français)" },
  { code: "MC", label: "Monaco (English)" },
  { code: "NL", label: "Netherlands (English)" },
  { code: "PL", label: "Poland (English)" },
  { code: "PT", label: "Portugal (English)" },
  { code: "RO", label: "Romania (English)" },
  { code: "SK", label: "Slovakia (English)" },
  { code: "SI", label: "Slovenia (English)" },
  { code: "ES", label: "Spain (English)" },
  { code: "SE", label: "Sweden (English)" },
  { code: "CH", label: "Schweiz (Deutsch)" },
  { code: "CH", label: "Switzerland (English)" },
  { code: "CH", label: "Svizzera (Italiano)" },
  { code: "CH", label: "Suisse (Français)" },
  { code: "UA", label: "Ukraine (English)" },
  { code: "GB", label: "United Kingdom (English)" },
];

const AMERICA: Entry[] = [
  { code: "US", label: "United States (English)" },
  { code: "CA", label: "Canada (English)" },
  { code: "CA", label: "Canada (Français)" },
];

const ASIA: Entry[] = [
  { code: "HK", label: "Hong Kong S.A.R (English)" },
  { code: "HK", label: "香港特別行政區 (繁體中文)" },
  { code: "JP", label: "日本 (日本語)" },
  { code: "JP", label: "Japan (English)" },
  { code: "KR", label: "한국 (한국어)" },
  { code: "KR", label: "Korea, Republic of (English)" },
  { code: "CN", label: "中国大陆 (简体中文)" },
];

const MIDDLE_EAST: Entry[] = [
  { code: "BH", label: "Bahrain (English)" },
  { code: "BH", label: "البحرين (عربي)" },
  { code: "KW", label: "Kuwait (English)" },
  { code: "KW", label: "الكويت (عربي)" },
  { code: "QA", label: "Qatar (English)" },
  { code: "QA", label: "دولة قطر (عربي)" },
  { code: "SA", label: "Saudi Arabia (English)" },
  { code: "SA", label: "المملكة العربية السعودية (عربي)" },
  { code: "AE", label: "United Arab Emirate (English)" },
  { code: "AE", label: "الإمارات العربية المتحدة (عربي)" },
];

const BROWSE_ONLY: Entry[] = [
  { code: "FR", label: "International (English)" },
  { code: "TW", label: "台灣 (繁體中文)" },
  { code: "TW", label: "Taiwan (English)" },
];

const COLUMNS_EUROPE: Entry[][] = [
  EUROPE.slice(0, 14),
  EUROPE.slice(14, 28),
  EUROPE.slice(28),
];

export default function ShippingRegionModal({ open, onClose }: ShippingRegionModalProps) {
  const { region, setRegion } = useRegionCurrency();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const select = (code: string) => {
    // Only switch if we actually support pricing/locale for the ISO.
    if (REGIONS.find((r) => r.code === code) || code) {
      setRegion(code);
    }
    onClose();
  };

  const renderEntry = (e: Entry, i: number) => {
    const active = region.countryCode === e.code;
    return (
      <button
        key={`${e.code}-${e.label}-${i}`}
        onClick={() => select(e.code)}
        className={`block text-left text-[12px] tracking-[0.04em] py-1.5 transition-colors duration-300 font-sans ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {e.label}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="fixed inset-0 z-[1000] bg-background overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Shipping country and region"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 md:px-12 pt-10 md:pt-12 pb-8">
            <h2 className="font-serif text-[22px] md:text-[26px] tracking-[0.06em] text-foreground font-light">
              Shipping to - Country/Region
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-6 md:right-12 top-10 md:top-12 w-9 h-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 md:px-12 pb-12 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-x-8 gap-y-12">
              {/* Europe — spans 3 cols, internal 3-col split */}
              <section className="md:col-span-3">
                <h3 className="font-serif text-[15px] tracking-[0.08em] text-foreground mb-6 font-light">Europe</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6">
                  {COLUMNS_EUROPE.map((col, ci) => (
                    <div key={ci} className="flex flex-col">
                      {col.map(renderEntry)}
                    </div>
                  ))}
                </div>
              </section>

              {/* America */}
              <section className="md:col-span-1">
                <h3 className="font-serif text-[15px] tracking-[0.08em] text-foreground mb-6 font-light">America</h3>
                <div className="flex flex-col">{AMERICA.map(renderEntry)}</div>
              </section>

              {/* Asia */}
              <section className="md:col-span-1">
                <h3 className="font-serif text-[15px] tracking-[0.08em] text-foreground mb-6 font-light">Asia</h3>
                <div className="flex flex-col">{ASIA.map(renderEntry)}</div>
              </section>

              {/* Middle East */}
              <section className="md:col-span-1">
                <h3 className="font-serif text-[15px] tracking-[0.08em] text-foreground mb-6 font-light">Middle East</h3>
                <div className="flex flex-col">{MIDDLE_EAST.map(renderEntry)}</div>
              </section>
            </div>

            {/* Browse only */}
            <div className="mt-16 pt-8 border-t border-border/60">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                <span className="font-serif text-[14px] tracking-[0.06em] text-foreground font-light">Browse only:</span>
                {BROWSE_ONLY.map(renderEntry)}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
