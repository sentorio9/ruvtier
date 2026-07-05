/**
 * Allocation Request Drawer — generic "register interest" panel used by
 * coming-soon category pages and category-level CTAs. Writes to the
 * existing `preorder_requests` table so allocation leads surface in the
 * Admin Preorders view alongside product-specific requests.
 */
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";

interface Props {
  open: boolean;
  onClose: () => void;
  category?: string;
  headline?: string;
}

const inputClass =
  "w-full h-11 px-4 bg-transparent border border-border text-foreground text-sm tracking-wide placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground transition-colors duration-300";
const labelClass =
  "block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2";

const AllocationRequestDrawer = ({ open, onClose, category, headline }: Props) => {
  const [form, setForm] = useState({ full_name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (open) startedAtRef.current = Date.now();
  }, [open]);

  useEffect(() => {
    if (!submitted) return;
    const t = window.setTimeout(() => {
      onClose();
      window.setTimeout(() => {
        setSubmitted(false);
        setForm({ full_name: "", email: "", message: "" });
      }, 400);
    }, 2400);
    return () => window.clearTimeout(t);
  }, [submitted, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) { setSubmitted(true); return; }

    if (!form.full_name.trim() || !form.email.trim()) { setError(FORM_ERRORS.required); return; }
    if (!isValidEmail(form.email)) { setError(FORM_ERRORS.invalidEmail); return; }
    if (form.full_name.length > 100 || form.message.length > 500) { setError(FORM_ERRORS.tooLong); return; }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const label = category ? `Allocation interest — ${category}` : "Allocation interest";
    const { error: dbError } = await supabase.from("preorder_requests" as any).insert({
      product_id: null,
      product_name: label,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      message: form.message.trim() || null,
      user_id: user?.id || null,
    } as any);

    setSubmitting(false);
    if (dbError) { setError(FORM_ERRORS.generic); return; }
    setSubmitted(true);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        <div className="px-8 py-10">
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Register Interest
            </p>
            <h2 className="font-serif font-light text-2xl tracking-wide text-foreground mb-2">
              {headline || category || "The house"}
            </h2>
            <p className="text-xs text-muted-foreground/80 tracking-wide">
              A steward of the house will be in touch when the first pieces are released.
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center">
              <p className="font-serif font-light text-lg text-foreground mb-3">
                Your interest has been received.
              </p>
              <p className="text-sm text-muted-foreground tracking-wide leading-relaxed">
                We will write to you when the moment is right.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input {...honeypotInputProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              <div>
                <label className={labelClass}>Full name</label>
                <input type="text" value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  className={inputClass} maxLength={100} required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className={inputClass} maxLength={255} required />
              </div>
              <div>
                <label className={labelClass}>
                  Message{" "}
                  <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
                </label>
                <textarea value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className={`${inputClass} h-auto py-3`} rows={3} maxLength={500} />
              </div>

              {error && <p className="text-xs text-red-400 tracking-wide">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full py-4 bg-foreground text-background text-xs tracking-[0.2em] uppercase transition-opacity duration-300 hover:opacity-80 disabled:opacity-40">
                {submitting ? "Submitting..." : "Register Interest"}
              </button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AllocationRequestDrawer;
