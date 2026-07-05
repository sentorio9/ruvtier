/**
 * Site-wide launch status banner.
 *
 * A hairline strip that sits directly beneath the navigation, quietly
 * confirming RUVTIER's current mode of trade (private appointment +
 * allocation). Dismissible on mobile to reclaim vertical space; the
 * dismissal is session-scoped so the banner returns on the next visit.
 */
import { useEffect, useState } from "react";

const STORAGE_KEY = "ruvtier_launch_banner_dismissed";

const LaunchStatusBanner = () => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
  };

  return (
    <div className="fixed top-[52px] md:top-[96px] left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12 h-[32px] md:h-[34px] flex items-center justify-center relative">
        <p className="font-sans font-light text-[10px] md:text-[11px] tracking-[0.18em] uppercase text-muted-foreground text-center leading-none">
          RUVTIER is currently available by private appointment and allocation request
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notice"
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="0.8">
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default LaunchStatusBanner;
