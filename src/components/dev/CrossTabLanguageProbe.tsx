/**
 * Temporary verification widget: simulates what happens in THIS tab when a
 * SIBLING tab writes `ruvtier_language` to localStorage.
 *
 * The browser fires `window.addEventListener("storage", ...)` on every other
 * same-origin tab when one tab calls `localStorage.setItem`. The originating
 * tab does NOT receive its own event. So to faithfully simulate the receiving
 * side, we dispatch a synthetic StorageEvent without first calling setItem
 * (which would also trigger our internal pub/sub via setLanguageGlobal).
 *
 * Remove this component after verification.
 */
import { useState } from "react";

const STEPS: Array<{ label: string; value: string }> = [
  { label: "→ FR (sibling tab)", value: "fr" },
  { label: "→ JA (sibling tab)", value: "ja" },
  { label: "→ AR (sibling tab, RTL)", value: "ar" },
  { label: "→ EN (sibling tab)", value: "en" },
];

export default function CrossTabLanguageProbe() {
  const [last, setLast] = useState<string>("");

  const simulate = (value: string) => {
    // Mirror what a sibling tab actually does: write the key first…
    try { localStorage.setItem("ruvtier_language", value); } catch { /* ignore */ }
    // …then dispatch the StorageEvent that the OTHER tab would naturally
    // receive. In a real two-tab scenario the originating tab does not
    // receive the event, but here we are pretending to BE the receiving tab.
    const evt = new StorageEvent("storage", {
      key: "ruvtier_language",
      newValue: value,
      oldValue: last || null,
      storageArea: localStorage,
      url: window.location.href,
    });
    window.dispatchEvent(evt);
    setLast(value);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-1.5 rounded-md border border-border bg-background/95 p-3 shadow-xl backdrop-blur">
      <p className="font-sans text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
        Cross-tab probe
      </p>
      {STEPS.map((s) => (
        <button
          key={s.value}
          onClick={() => simulate(s.value)}
          className="text-left font-sans text-[11px] tracking-[0.08em] text-foreground hover:text-primary transition-colors"
        >
          {s.label}
        </button>
      ))}
      {last && (
        <p className="font-sans text-[10px] text-muted-foreground mt-1">
          last simulated: <span className="text-foreground">{last}</span>
        </p>
      )}
    </div>
  );
}
