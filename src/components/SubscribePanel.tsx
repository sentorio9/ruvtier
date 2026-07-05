/**
 * SubscribePanel — confirmation panel opened after a footer newsletter
 * submit. Collects optional first/last name alongside the email and
 * writes the subscription via Supabase.
 *
 * Props:
 *   - `isOpen: boolean` · `onClose(): void`
 *
 * Used by: every page that renders `LuxuryFooter` (the footer raises
 * `onSubscribeClick`, the host page opens this panel).
 *
 * Design-system dependencies: page canvas, hairline inputs, single
 * easing curve. Form protection via `src/lib/formProtection.ts`.
 * Escape closes; body scroll locks while open.
 */
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";

interface SubscribePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribePanel = ({ isOpen, onClose }: SubscribePanelProps) => {
  useBodyScrollLock(isOpen);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "" });
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  // Escape key dismiss + focus restore on close (a11y).
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      startedAtRef.current = Date.now();
      const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    } else if (triggerRef.current) {
      triggerRef.current.focus?.();
    }
  }, [isOpen, onClose]);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) {
      setSubmitted(true);
      return;
    }

    if (!isValidEmail(form.email)) {
      setError(FORM_ERRORS.invalidEmail);
      return;
    }
    if (form.firstName.length > 80 || form.lastName.length > 80) {
      setError(FORM_ERRORS.tooLong);
      return;
    }

    const subject = encodeURIComponent("Newsletter Subscription");
    const body = encodeURIComponent(
      `New subscriber:\n\nEmail: ${form.email.trim()}\nFirst Name: ${form.firstName.trim()}\nLast Name: ${form.lastName.trim()}`
    );
    window.open(`mailto:clientservices@ruvtier.com?subject=${subject}&body=${body}`, "_self");
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    setForm({ email: "", firstName: "", lastName: "" });
    setHoneypot("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-foreground/20"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[100] w-[85vw] sm:w-[40vw] lg:w-[25vw] bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-end h-16 md:h-20 px-6">
              <button onClick={handleClose} className="luxury-button p-2" aria-label="Close">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 gap-6">
              {submitted ? (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-light text-xl tracking-wider text-foreground">
                    Thank you
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for subscribing to Ruvtier.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-serif font-light text-xl tracking-wider text-foreground">
                    Subscribe to our newsletter
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Receive and discover our world, collections, and latest news.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Honeypot */}
                    <input
                      {...honeypotInputProps}
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                    {[
                      { key: "email", label: "Email", type: "email", maxLength: 255 },
                      { key: "firstName", label: "First Name", type: "text", maxLength: 80 },
                      { key: "lastName", label: "Last Name", type: "text", maxLength: 80 },
                    ].map(({ key, label, type, maxLength }) => (
                      <div key={key} className="border-b border-foreground/20">
                        <input
                          type={type}
                          required={key === "email"}
                          maxLength={maxLength}
                          value={form[key as keyof typeof form]}
                          onChange={handleChange(key)}
                        placeholder={label}
                        aria-label={label}
                        className="w-full bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/70 focus:outline-none"
                        />
                      </div>
                    ))}

                    {error && (
                      <p role="alert" className="text-xs text-muted-foreground tracking-wide">{error}</p>
                    )}

                    <button type="submit" className="luxury-button mt-4 self-start !text-[13px]">
                      Subscribe
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscribePanel;
