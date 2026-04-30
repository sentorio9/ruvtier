import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** Optional phrase the user must type to confirm (e.g. the item name). */
  requirePhrase?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Calm, on-brand confirmation modal for destructive admin actions.
 * Replaces window.confirm() so destructive flows are deliberate and accessible.
 */
export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  requirePhrase,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  // Capture trigger, focus first sensible element, restore focus on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      setTimeout(() => {
        if (requirePhrase) inputRef.current?.focus();
        else cancelRef.current?.focus();
      }, 50);
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    } else if (triggerRef.current) {
      triggerRef.current.focus?.();
    }
  }, [open, onCancel, requirePhrase]);

  const [typed, setTyped] = useStateLike(requirePhrase ? "" : "OK", open);
  const phraseOk = !requirePhrase || typed.trim() === requirePhrase.trim();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-[hsl(220,15%,3%)]/80 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,16%)] p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle
                size={18}
                strokeWidth={1.4}
                className={destructive ? "text-[hsl(0,55%,55%)] mt-0.5 shrink-0" : "text-[hsl(40,60%,55%)] mt-0.5 shrink-0"}
              />
              <h2
                id="confirm-modal-title"
                className="text-[14px] tracking-[0.06em] text-[hsl(220,10%,85%)]"
                style={fontStyle}
              >
                {title}
              </h2>
            </div>

            {description && (
              <p className="text-[12px] text-[hsl(220,10%,55%)] leading-[1.7] mb-5" style={fontStyle}>
                {description}
              </p>
            )}

            {requirePhrase && (
              <div className="mb-5">
                <label className="block text-[10px] tracking-[0.14em] uppercase text-[hsl(220,10%,45%)] mb-2" style={fontStyle}>
                  Type <span className="text-[hsl(220,10%,80%)]">{requirePhrase}</span> to confirm
                </label>
                <input
                  ref={inputRef}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="w-full h-9 px-3 bg-[hsl(220,15%,7%)] border border-[hsl(220,10%,18%)] text-[hsl(220,10%,85%)] text-[13px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
                  style={fontStyle}
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                ref={cancelRef}
                onClick={onCancel}
                className="h-9 px-4 text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,80%)] transition-colors"
                style={fontStyle}
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => phraseOk && onConfirm()}
                disabled={!phraseOk}
                className={
                  destructive
                    ? "h-9 px-5 text-[11px] tracking-[0.12em] uppercase bg-[hsl(0,55%,38%)] text-[hsl(220,10%,95%)] hover:bg-[hsl(0,55%,46%)] transition-colors disabled:opacity-30"
                    : "h-9 px-5 text-[11px] tracking-[0.12em] uppercase bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-30"
                }
                style={fontStyle}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Tiny local helper so the "typed" value resets when the dialog reopens
// without polluting the public API.
function useStateLike(initial: string, resetSignal: boolean) {
  const [v, set] = (require("react") as typeof import("react")).useState(initial);
  (require("react") as typeof import("react")).useEffect(() => {
    set(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);
  return [v, set] as const;
}
