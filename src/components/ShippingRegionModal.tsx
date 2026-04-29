import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRegionCurrency, REGIONS } from "@/hooks/useRegionCurrency";
import {
  useLanguage,
  COUNTRY_LANGUAGES,
  LANGUAGE_LABELS,
  getDefaultLanguageForCountry,
  type LanguageCode,
} from "@/hooks/useLanguage";

interface ShippingRegionModalProps {
  open: boolean;
  onClose: () => void;
}

// Country entries are deduplicated — language is now picked separately
// inside the slide-in language panel.
type Country = { code: string; name: string };

const EUROPE: Country[] = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "MC", name: "Monaco" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "UA", name: "Ukraine" },
  { code: "GB", name: "United Kingdom" },
];

const AMERICAS: Country[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
];

const ASIA_PACIFIC: Country[] = [
  { code: "HK", name: "Hong Kong S.A.R" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "Korea, Republic of" },
  { code: "CN", name: "China" },
  { code: "SG", name: "Singapore" },
  { code: "AU", name: "Australia" },
];

const MIDDLE_EAST: Country[] = [
  { code: "BH", name: "Bahrain" },
  { code: "KW", name: "Kuwait" },
  { code: "QA", name: "Qatar" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
];

const BROWSE_ONLY: Country[] = [
  { code: "FR", name: "International" },
  { code: "TW", name: "Taiwan" },
];

type RegionGroup = { id: string; label: string; entries: Country[] };

const GROUPS: RegionGroup[] = [
  { id: "europe", label: "Europe", entries: EUROPE },
  { id: "americas", label: "Americas", entries: AMERICAS },
  { id: "asia", label: "Asia Pacific", entries: ASIA_PACIFIC },
  { id: "middle-east", label: "Middle East", entries: MIDDLE_EAST },
];

export default function ShippingRegionModal({ open, onClose }: ShippingRegionModalProps) {
  const { region, setRegion } = useRegionCurrency();
  const { language, setLanguage } = useLanguage();

  const [activeGroup, setActiveGroup] = useState<string>("europe");
  const [query, setQuery] = useState("");

  // Two-step selection state
  const [pendingCountry, setPendingCountry] = useState<Country | null>(null);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageCode | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (pendingCountry) {
          setPendingCountry(null);
          setPendingLanguage(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, pendingCountry]);

  // Reset transient state every time the modal opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveGroup("europe");
      setPendingCountry(null);
      setPendingLanguage(null);
    }
  }, [open]);

  const openLanguagePanel = (country: Country) => {
    setPendingCountry(country);
    // Pre-select the user's current language if it's offered for this country,
    // otherwise the country's default.
    const offered = COUNTRY_LANGUAGES[country.code] ?? ["en"];
    setPendingLanguage(
      offered.includes(language) ? language : getDefaultLanguageForCountry(country.code)
    );
  };

  const confirmSelection = () => {
    if (!pendingCountry || !pendingLanguage) return;
    setRegion(pendingCountry.code);
    setLanguage(pendingLanguage);
    onClose();
  };

  const normalisedQuery = query.trim().toLowerCase();
  const isSearching = normalisedQuery.length > 0;

  // ── Fuzzy + ISO-aware scoring ──
  // Higher score = stronger match. Returns null when there is no plausible match.
  const scoreCountry = (c: Country, q: string): number | null => {
    const name = c.name.toLowerCase();
    const code = c.code.toLowerCase();

    // ISO code matches rank highest — exact, then prefix.
    if (code === q) return 1000;
    if (q.length <= 3 && code.startsWith(q)) return 900 - (code.length - q.length);

    // Whole-word / start-of-name matches.
    if (name === q) return 850;
    if (name.startsWith(q)) return 800 - (name.length - q.length);

    // Word-boundary match (e.g. "arab" → "United Arab Emirates").
    const words = name.split(/\s+/);
    if (words.some((w) => w.startsWith(q))) return 700;

    // Substring anywhere in name.
    const idx = name.indexOf(q);
    if (idx !== -1) return 600 - idx;

    // Subsequence fuzzy match: every char of q appears in order in name.
    let i = 0;
    let lastIdx = -1;
    let gaps = 0;
    for (let j = 0; j < name.length && i < q.length; j++) {
      if (name[j] === q[i]) {
        if (lastIdx !== -1) gaps += j - lastIdx - 1;
        lastIdx = j;
        i++;
      }
    }
    if (i === q.length && q.length >= 2) return 400 - gaps;

    // Tiny single-char Levenshtein tolerance for typos on short queries.
    if (q.length >= 4) {
      const lev = (a: string, b: string) => {
        const dp = Array.from({ length: a.length + 1 }, (_, x) => [x, ...Array(b.length).fill(0)]);
        for (let y = 1; y <= b.length; y++) dp[0][y] = y;
        for (let x = 1; x <= a.length; x++)
          for (let y = 1; y <= b.length; y++)
            dp[x][y] = a[x - 1] === b[y - 1]
              ? dp[x - 1][y - 1]
              : 1 + Math.min(dp[x - 1][y - 1], dp[x - 1][y], dp[x][y - 1]);
        return dp[a.length][b.length];
      };
      // Compare against name prefix of equal length to keep it cheap.
      const prefix = name.slice(0, q.length);
      if (lev(prefix, q) <= 1) return 350;
    }

    return null;
  };

  const rankEntries = (entries: Country[]): Country[] => {
    const scored = entries
      .map((c) => ({ c, s: scoreCountry(c, normalisedQuery) }))
      .filter((x): x is { c: Country; s: number } => x.s !== null)
      .sort((a, b) => b.s - a.s || a.c.name.localeCompare(b.c.name));
    return scored.map((x) => x.c);
  };

  const filteredGroups = useMemo(() => {
    if (!isSearching) return GROUPS;
    return GROUPS.map((g) => ({ ...g, entries: rankEntries(g.entries) }))
      .filter((g) => g.entries.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, normalisedQuery]);

  const filteredBrowseOnly = useMemo(() => {
    if (!isSearching) return BROWSE_ONLY;
    return rankEntries(BROWSE_ONLY);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, normalisedQuery]);

  const visibleGroup = isSearching
    ? null
    : GROUPS.find((g) => g.id === activeGroup) ?? GROUPS[0];

  const splitColumns = (entries: Country[], columns: number): Country[][] => {
    const perCol = Math.ceil(entries.length / columns);
    return Array.from({ length: columns }, (_, i) =>
      entries.slice(i * perCol, (i + 1) * perCol)
    );
  };

  const renderCountry = (c: Country, i: number) => {
    const isActive = region.countryCode === c.code;
    const supported = REGIONS.some((r) => r.code === c.code);
    const langs = COUNTRY_LANGUAGES[c.code] ?? ["en"];
    return (
      <button
        key={`${c.code}-${c.name}-${i}`}
        onClick={() => openLanguagePanel(c)}
        title={!supported ? "Pricing & locale not yet tailored — browse in English" : undefined}
        className={`group relative flex items-baseline justify-between gap-3 text-left text-[12.5px] tracking-[0.04em] py-1.5 pr-3 transition-colors duration-300 font-sans ${
          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="relative inline-block">
          {c.name}
          <span
            aria-hidden
            className={`absolute left-0 right-0 -bottom-0.5 h-px bg-foreground/70 origin-left transform transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
            }`}
          />
        </span>
        <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground/50 shrink-0 flex items-center gap-1.5">
          {!supported && (
            <span className="text-muted-foreground/60 italic normal-case tracking-[0.04em] font-serif">
              browse only
            </span>
          )}
          <span>{langs.length > 1 ? `${langs.length} langs` : langs[0].toUpperCase()}</span>
        </span>
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
          aria-label="Shipping country and language"
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
                  Currently
                </span>
                <span className="font-serif font-light text-[18px] md:text-[20px] tracking-[0.04em] text-foreground">
                  {region.country} · {region.currency} · {LANGUAGE_LABELS[language]}
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
                  placeholder="Type a country name or ISO code…"
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
              <div className="space-y-12">
                {filteredGroups.length === 0 && filteredBrowseOnly.length === 0 ? (
                  <p className="font-serif font-light text-[16px] text-muted-foreground italic">
                    No destinations match "{query}".
                  </p>
                ) : (
                  <>
                    {filteredGroups.map((g) => (
                      <section key={g.id}>
                        <h3 className="font-serif text-[15px] tracking-[0.18em] uppercase text-foreground/80 mb-5 font-light">
                          {g.label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                          {g.entries.map(renderCountry)}
                        </div>
                      </section>
                    ))}
                    {filteredBrowseOnly.length > 0 && (
                      <section>
                        <h3 className="font-serif text-[15px] tracking-[0.18em] uppercase text-foreground/80 mb-5 font-light">
                          Browse only
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
                          {filteredBrowseOnly.map(renderCountry)}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            ) : (
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
                              {col.map(renderCountry)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {!isSearching && (
              <div className="mt-16 pt-8 border-t border-border/60">
                <div className="flex flex-col md:flex-row md:items-center gap-y-3 gap-x-10">
                  <span className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 md:min-w-[140px]">
                    Browse only
                  </span>
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    {BROWSE_ONLY.map(renderCountry)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Language sub-panel (slides over from the right) ─── */}
          <AnimatePresence>
            {pendingCountry && (
              <>
                <motion.div
                  key="lang-scrim"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                  className="fixed inset-0 z-[1001] bg-foreground/20"
                  onClick={() => { setPendingCountry(null); setPendingLanguage(null); }}
                />
                <motion.aside
                  key="lang-panel"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                  className="fixed top-0 right-0 z-[1002] h-full w-full sm:w-[440px] bg-background border-l border-border/60 flex flex-col"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Choose language for ${pendingCountry.name}`}
                >
                  {/* Sub-panel header */}
                  <div className="flex items-center justify-between px-7 md:px-9 py-6 border-b border-border/50">
                    <button
                      onClick={() => { setPendingCountry(null); setPendingLanguage(null); }}
                      className="group flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Back to country list"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 6l-6 6 6 6" />
                      </svg>
                      <span>Back</span>
                    </button>
                    <button
                      onClick={onClose}
                      aria-label="Close"
                      className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>

                  {/* Sub-panel body */}
                  <div className="flex-1 overflow-y-auto px-7 md:px-9 py-10">
                    <span className="block text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 mb-3">
                      Shipping to
                    </span>
                    <h3 className="font-serif font-light text-[26px] md:text-[30px] tracking-[0.02em] text-foreground mb-10">
                      {pendingCountry.name}
                    </h3>

                    <span className="block text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 mb-5">
                      Choose a language
                    </span>
                    <ul className="flex flex-col">
                      {(COUNTRY_LANGUAGES[pendingCountry.code] ?? ["en"]).map((lc) => {
                        const isActive = pendingLanguage === lc;
                        return (
                          <li key={lc}>
                            <button
                              onClick={() => setPendingLanguage(lc)}
                              className={`group w-full flex items-center justify-between py-3 border-b border-border/50 transition-colors duration-300 ${
                                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                              }`}
                              aria-pressed={isActive}
                            >
                              <span className="font-serif font-light text-[18px] tracking-[0.03em]">
                                {LANGUAGE_LABELS[lc]}
                              </span>
                              <span
                                aria-hidden
                                className={`relative w-3 h-3 rounded-full border border-foreground/60 transition-all duration-300 ${
                                  isActive ? "bg-foreground" : "bg-transparent group-hover:bg-foreground/30"
                                }`}
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Sub-panel footer */}
                  <div className="px-7 md:px-9 py-6 border-t border-border/50">
                    <button
                      onClick={confirmSelection}
                      disabled={!pendingLanguage}
                      className="group relative w-full text-[11px] tracking-[0.32em] uppercase text-foreground py-3 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                    >
                      <span className="relative inline-block">
                        Confirm Selection
                        <span
                          aria-hidden
                          className="absolute left-0 right-0 -bottom-0.5 h-px bg-foreground/70 origin-left transform scale-x-0 group-hover:scale-x-100 group-disabled:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                        />
                      </span>
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
