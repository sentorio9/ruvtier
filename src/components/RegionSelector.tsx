import { useState } from "react";
import { useRegionCurrency, REGIONS } from "@/hooks/useRegionCurrency";
import { Globe, Loader2, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function formatRelative(ts: number | null): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}

export default function RegionSelector() {
  const { region, setRegion, refreshing, ratesUpdatedAt, refreshRates } = useRegionCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Change region and currency"
      >
        <Globe size={13} strokeWidth={1.5} />
        <span>{region.countryCode}</span>
        <span className="text-muted-foreground/60">|</span>
        <span>{region.currency}</span>
        {refreshing && <Loader2 size={11} className="animate-spin opacity-70 ml-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[998]" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full mb-2 right-0 z-[999] w-64 max-h-80 overflow-hidden bg-background border border-border shadow-xl flex flex-col"
            >
              <div className="max-h-60 overflow-y-auto">
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => { setRegion(r.code); setOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[11px] tracking-wide flex items-center justify-between transition-colors ${
                      region.countryCode === r.code
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className="text-[10px] text-muted-foreground/60">{r.symbol} {r.currency}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-border px-4 py-2.5 flex items-center justify-between text-[10px] tracking-wide text-muted-foreground/80">
                <span>Rates {formatRelative(ratesUpdatedAt)}</span>
                <button
                  onClick={() => refreshRates()}
                  disabled={refreshing}
                  className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
                  aria-label="Refresh exchange rates"
                >
                  {refreshing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                  <span className="uppercase tracking-[0.18em]">Refresh</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
