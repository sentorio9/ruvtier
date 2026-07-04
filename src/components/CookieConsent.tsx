import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_KEY = "ruvtier_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: "all" | "essential") => {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ level, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 md:px-8 md:pb-8"
        >
          <div className="max-w-3xl mx-auto bg-background border border-border p-6 md:p-8 shadow-2xl">
            <p className="font-serif text-sm md:text-base tracking-wide leading-relaxed text-foreground mb-1">
              We value your privacy
            </p>
            <p className="text-[11px] md:text-xs tracking-wide leading-relaxed text-muted-foreground mb-6">
              This site uses cookies to ensure the best experience. Essential cookies are required
              for the site to function. Analytics cookies help us understand how visitors engage
              with RUVTIER.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => accept("all")}
                className="px-6 py-2.5 bg-foreground text-background text-[10px] tracking-[0.2em] uppercase transition-opacity hover:opacity-80"
              >
                Accept all
              </button>
              <button
                onClick={() => accept("essential")}
                className="px-6 py-2.5 border border-border text-foreground text-[10px] tracking-[0.2em] uppercase transition-colors hover:border-foreground"
              >
                Essential only
              </button>
              <a
                href="/cookie-policy"
                className="ml-auto text-[10px] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground transition-colors hidden md:block"
              >
                Cookie policy
              </a>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
