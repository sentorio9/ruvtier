import { AnimatePresence, motion } from "framer-motion";
import { useRegionCurrency } from "@/hooks/useRegionCurrency";

export default function LocationConsentPrompt() {
  const { needsLocationConsent, acceptLocationConsent, dismissLocationConsent, region } = useRegionCurrency();

  return (
    <AnimatePresence>
      {needsLocationConsent && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-[380px] z-[60] bg-background border border-border shadow-xl"
          role="dialog"
          aria-live="polite"
          aria-label="Region preference"
        >
          <div className="px-5 py-5 md:px-6 md:py-6">
            <p className="font-sans text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
              Region & Currency
            </p>
            <p className="font-serif font-light text-[15px] leading-[1.7] text-foreground mb-4">
              May we use your approximate location to show prices in your local currency?
              You are currently viewing in <span className="italic">{region.country} — {region.currency}</span>.
            </p>
            <p className="font-sans text-[11px] tracking-wide text-muted-foreground/80 mb-5 leading-[1.7]">
              No precise location is stored. You can change your region anytime from the footer.
            </p>
            <div className="flex items-center gap-5">
              <button
                onClick={acceptLocationConsent}
                className="text-[11px] tracking-[0.18em] uppercase text-foreground border-b border-foreground/40 pb-0.5 hover:border-foreground transition-colors"
              >
                Allow
              </button>
              <button
                onClick={dismissLocationConsent}
                className="text-[11px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
