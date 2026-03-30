import { useState } from "react";
import { useRegionCurrency, REGIONS } from "@/hooks/useRegionCurrency";
import { Globe } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function RegionSelector() {
  const { region, setRegion } = useRegionCurrency();
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
              className="absolute bottom-full mb-2 right-0 z-[999] w-56 max-h-72 overflow-y-auto bg-background border border-border shadow-xl"
            >
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
