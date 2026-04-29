import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegionCurrency, REGIONS } from "@/hooks/useRegionCurrency";

interface ShippingRegionModalProps {
  open: boolean;
  onClose: () => void;
}

// Each entry maps a localised label to an ISO country code that the region
// hook understands. Several locales can resolve to the same ISO code.
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

const AMERICAS: Entry[] = [
  { code: "US", label: "United States (English)" },
  { code: "CA", label: "Canada (English)" },
  { code: "CA", label: "Canada (Français)" },
  { code: "BR", label: "Brasil (Português)" },
  { code: "MX", label: "México (Español)" },
];

const ASIA_PACIFIC: Entry[] = [
  { code: "HK", label: "Hong Kong S.A.R (English)" },
  { code: "HK", label: "香港特別行政區 (繁體中文)" },
  { code: "JP", label: "日本 (日本語)" },
  { code: "JP", label: "Japan (English)" },
  { code: "KR", label: "한국 (한국어)" },
  { code: "KR", label: "Korea, Republic of (English)" },
  { code: "CN", label: "中国大陆 (简体中文)" },
  { code: "SG", label: "Singapore (English)" },
  { code: "AU", label: "Australia (English)" },
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
  { code: "AE", label: "United Arab Emirates (English)" },
  { code: "AE", label: "الإمارات العربية المتحدة (عربي)" },
];

const BROWSE_ONLY: Entry[] = [
  { code: "FR", label: "International (English)" },
  { code: "TW", label: "台灣 (繁體中文)" },
  { code: "TW", label: "Taiwan (English)" },
];

type RegionGroup = { id: string; label: string; entries: Entry[] };

const GROUPS: RegionGroup[] = [
  { id: "europe", label: "Europe", entries: EUROPE },
  { id: "americas", label: "Americas", entries: AMERICAS },
  { id: "asia", label: "Asia Pacific", entries: ASIA_PACIFIC },
  { id: "middle-east", label: "Middle East", entries: MIDDLE_EAST },
];

export default function ShippingRegionModal({ open, onClose }: ShippingRegionModalProps) {
  const { region, setRegion } = useRegionCurrency();
  const [activeGroup, setActiveGroup] = useState<string>("europe");
  const [query, setQuery] = useState("");

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

  // Reset transient state every time the modal opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveGroup("europe");
    }
  }, [open]);

  const select = (code: string) => {
    setRegion(code);
    onClose();
  };

  const normalisedQuery = query.trim().toLowerCase();
  const isSearching = normalisedQuery.length > 0;

  const filteredGroups = useMemo(() => {
    if (!isSearching) return GROUPS;
    return GROUPS.map((g) => ({
      ...g,
      entries: g.entries.filter((e) => e.label.toLowerCase().includes(normalisedQuery)),
    })).filter((g) => g.entries.length > 0);
  }, [isSearching, normalisedQuery]);

  const filteredBrowseOnly = useMemo(() => {
    if (!isSearching) return BROWSE_ONLY;
    return BROWSE_ONLY.filter((e) => e.label.toLowerCase().includes(normalisedQuery));
  }, [isSearching, normalisedQuery]);

  const visibleGroup = isSearching
    ? null
    : GROUPS.find((g) => g.id === activeGroup) ?? GROUPS[0];

  // Split a list of entries into balanced columns.
  const splitColumns = (entries: Entry[], columns: number): Entry[][] => {
    const perCol = Math.ceil(entries.length / columns);
    return Array.from({ length: columns }, (_, i) =>
      entries.slice(i * perCol, (i + 1) * perCol)
    );
  };

  const renderEntry = (e: Entry, i: number) => {
    const active = region.countryCode === e.code;
    const supported = REGIONS.some((r) => r.code === e.code);
    return (
      <button
        key={`${e.code}-${e.label}-${i}`}
        onClick={() => select(e.code)}
        className={`group relative block text-left text-[12.5px] tracking-[0.04em] py-1.5 pr-3 transition-colors duration-300 font-sans ${
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="relative inline-block">
          {e.label}
          <span
            aria-hidden
            className={`absolute left-0 right-0 -bottom-0.5 h-px bg-foreground/70 origin-left transform transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </span>
        {!supported && (
          <span className="ml-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground/50">
            EN
          </span>
        )}
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
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          className="fixed inset-0 z-[1000] bg-background overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Shipping country and region"
        >
          {/* ─── Header bar ─── */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 md:py-7 flex items-center justify-between gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 mb-1">
                  Ruvtier
                </span>
                <h2 className="font-serif text-[20px] md:text-[24px] tracking-[0.06em] text-foreground font-light">
                  Shipping &amp; Language
                </h2>
              </div>

              <button
                onClick={onClose}
                aria-label="Close"
                className="group flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="hidden sm:inline">Close</span>
                <span className="w-9 h-9 rounded-full border border-border flex items-center justify-center transition-colors group-hover:border-foreground">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* ─── Body ─── */}
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-10 md:pt-14 pb-16">
            {/* Intro + current */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 gap-x-10 mb-12 md:mb-16">
              <div className="md:col-span-7">
                <p className="font-serif font-light text-[20px] md:text-[26px] leading-snug tracking-[0.01em] text-foreground max-w-xl">
                  Choose where you would like the House to attend you.
                </p>
                <p className="text-[12px] tracking-[0.06em] text-muted-foreground mt-3 max-w-md leading-relaxed font-sans">
                  Prices, availability and language adapt to your selection.
                </p>
              </div>
              <div className="md:col-span-5 md:text-right flex md:flex-col items-start md:items-end gap-2">
                <span className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80">
                  Currently shipping to
                </span>
                <span className="font-serif font-light text-[18px] md:text-[20px] tracking-[0.04em] text-foreground">
                  {region.country} · {region.currency}
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="mb-10 md:mb-12 max-w-md">
              <label className="block text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 mb-3">
                Find a country
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a country or language…"
                  className="w-full bg-transparent border-b border-border focus:border-foreground text-[13px] tracking-[0.04em] text-foreground placeholder:text-muted-foreground/60 pb-2.5 pr-7 outline-none transition-colors duration-300 font-sans"
                />
                <svg
                  className="absolute right-0 bottom-3 text-muted-foreground"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </div>
            </div>

            {isSearching ? (
              // ─── Search results ───
              <div className="space-y-12">
                {filteredGroups.length === 0 && filteredBrowseOnly.length === 0 ? (
                  <p className="font-serif font-light text-[16px] text-muted-foreground italic">
                    No destinations match “{query}”.
                  </p>
                ) : (
                  <>
                    {filteredGroups.map((g) => (
                      <section key={g.id}>
                        <h3 className="font-serif text-[15px] tracking-[0.18em] uppercase text-foreground/80 mb-5 font-light">
                          {g.label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                          {g.entries.map(renderEntry)}
                        </div>
                      </section>
                    ))}
                    {filteredBrowseOnly.length > 0 && (
                      <section>
                        <h3 className="font-serif text-[15px] tracking-[0.18em] uppercase text-foreground/80 mb-5 font-light">
                          Browse only
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                          {filteredBrowseOnly.map(renderEntry)}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            ) : (
              // ─── Region rail (left) + entries (right) ───
              <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 gap-x-10 md:gap-x-16">
                {/* Left rail */}
                <nav className="md:col-span-3" aria-label="Regions">
                  <h3 className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 mb-5">
                    Regions
                  </h3>
                  <ul className="flex md:flex-col gap-x-8 gap-y-3 flex-wrap">
                    {GROUPS.map((g) => {
                      const isActive = activeGroup === g.id;
                      return (
                        <li key={g.id}>
                          <button
                            onClick={() => setActiveGroup(g.id)}
                            className={`group relative font-serif font-light text-[18px] md:text-[22px] tracking-[0.03em] transition-colors duration-300 ${
                              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                            aria-pressed={isActive}
                          >
                            <span className="relative inline-block">
                              {g.label}
                              <span
                                aria-hidden
                                className={`absolute left-0 right-0 -bottom-0.5 h-px bg-foreground/70 origin-left transform transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                                  isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                }`}
                              />
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Right content */}
                <div className="md:col-span-9">
                  <AnimatePresence mode="wait">
                    {visibleGroup && (
                      <motion.div
                        key={visibleGroup.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                      >
                        <div className="flex items-baseline justify-between mb-6">
                          <h3 className="font-serif text-[15px] tracking-[0.18em] uppercase text-foreground/80 font-light">
                            {visibleGroup.label}
                          </h3>
                          <span className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground/70">
                            {visibleGroup.entries.length} destinations
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                          {splitColumns(
                            visibleGroup.entries,
                            visibleGroup.entries.length > 18 ? 3 : visibleGroup.entries.length > 8 ? 2 : 1
                          ).map((col, ci) => (
                            <div key={ci} className="flex flex-col">
                              {col.map(renderEntry)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Browse only — always visible at the bottom when not searching */}
            {!isSearching && (
              <div className="mt-16 pt-8 border-t border-border/60">
                <div className="flex flex-col md:flex-row md:items-center gap-y-3 gap-x-10">
                  <span className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 md:min-w-[140px]">
                    Browse only
                  </span>
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    {BROWSE_ONLY.map(renderEntry)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
