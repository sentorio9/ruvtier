/**
 * Private Access Drawer — slides in from the right when the user
 * clicks "Request Allocation" on a preorder page.
 *
 * Owns the full Private Access request form that previously lived
 * inline on PreorderPage. Honeypot, timing guard, and Supabase write
 * behaviour are preserved verbatim.
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
import type { Product } from "@/hooks/useProducts";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil",
  "Brunei","Bulgaria","Cambodia","Cameroon","Canada","Chile","China","Colombia","Costa Rica","Croatia",
  "Cuba","Cyprus","Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia","Ethiopia",
  "Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hong Kong","Hungary",
  "Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan",
  "Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Maldives",
  "Malta","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Nepal",
  "Netherlands","New Zealand","Nigeria","North Macedonia","Norway","Oman","Pakistan","Panama","Paraguay",
  "Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Serbia",
  "Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden","Switzerland",
  "Taiwan","Tanzania","Thailand","Tunisia","Turkey","UAE","Uganda","Ukraine","United Kingdom","United States",
  "Uruguay","Uzbekistan","Venezuela","Vietnam","Zimbabwe"
];

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product | null | undefined;
  defaultSize?: string | null;
}

const inputClass =
  "w-full h-11 px-4 bg-transparent border border-border text-foreground text-sm tracking-wide placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground transition-colors duration-300";
const labelClass =
  "block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2";

const PrivateAccessDrawer = ({ open, onClose, product, defaultSize }: Props) => {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    country: "",
    size_preference: defaultSize || "",
    delivery_region: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const startedAtRef = useRef<number>(Date.now());

  // Reset timing guard each time the drawer opens; sync size if it changed.
  useEffect(() => {
    if (open) {
      startedAtRef.current = Date.now();
      setForm((prev) => ({ ...prev, size_preference: defaultSize || prev.size_preference }));
    }
  }, [open, defaultSize]);

  // Auto-close after a confirmed submission.
  useEffect(() => {
    if (!submitted) return;
    const t = window.setTimeout(() => {
      onClose();
      // Reset for next opening, after the slide-out animation.
      window.setTimeout(() => {
        setSubmitted(false);
        setForm({
          full_name: "",
          email: "",
          country: "",
          size_preference: defaultSize || "",
          delivery_region: "",
          message: "",
        });
      }, 400);
    }, 2400);
    return () => window.clearTimeout(t);
  }, [submitted, onClose, defaultSize]);

  const handleChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) {
      setSubmitted(true);
      return;
    }

    if (!form.full_name.trim() || !form.email.trim()) {
      setError(FORM_ERRORS.required);
      return;
    }
    if (!isValidEmail(form.email)) {
      setError(FORM_ERRORS.invalidEmail);
      return;
    }
    if (form.full_name.length > 100 || form.message.length > 500) {
      setError(FORM_ERRORS.tooLong);
      return;
    }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from("preorder_requests" as any).insert({
      product_id: product?.id,
      product_name: product?.name || "Unknown",
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      country: form.country || null,
      size_preference: form.size_preference || null,
      delivery_region: form.delivery_region || null,
      message: form.message.trim() || null,
      user_id: user?.id || null,
    } as any);

    setSubmitting(false);

    if (dbError) {
      setError(dbError.code === "23505" ? FORM_ERRORS.duplicate : FORM_ERRORS.generic);
      return;
    }
    setSubmitted(true);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-0"
      >
        <div className="px-8 py-10">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">
              Private Access Request
            </p>
            <h2 className="font-serif font-light text-2xl tracking-wide text-foreground mb-2">
              {product?.name}
            </h2>
            <p className="text-xs text-muted-foreground/80 tracking-wide">
              Available by allocation
            </p>
          </div>

          {submitted ? (
            <div className="py-12 text-center">
              <p className="font-serif font-light text-lg text-foreground mb-3">
                Your request has been received.
              </p>
              <p className="text-sm text-muted-foreground tracking-wide leading-relaxed">
                A steward of the house will review availability.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                {...honeypotInputProps}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
              <div>
                <label className={labelClass}>Full name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className={inputClass}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass}
                  maxLength={255}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <select
                  value={form.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Size / measurement preference</label>
                <select
                  value={form.size_preference}
                  onChange={(e) => handleChange("size_preference", e.target.value)}
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select size</option>
                  {["XS", "S", "M", "L", "XL", "XXL", "Made-to-Measure"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  Preferred delivery region{" "}
                  <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.delivery_region}
                  onChange={(e) => handleChange("delivery_region", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Europe, Middle East"
                  maxLength={100}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Message{" "}
                  <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`${inputClass} h-auto py-3`}
                  rows={3}
                  maxLength={500}
                />
              </div>

              {error && <p className="text-xs text-red-400 tracking-wide">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-foreground text-background text-xs tracking-[0.2em] uppercase transition-opacity duration-300 hover:opacity-80 disabled:opacity-40"
              >
                {submitting ? "Submitting..." : "Request access"}
              </button>
            </form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PrivateAccessDrawer;
