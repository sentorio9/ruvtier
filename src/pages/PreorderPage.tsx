import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { useProductBySlug, formatPrice, usePriceTick } from "@/hooks/useProducts";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";
import garmentImage from "@/assets/garment-single.jpg";

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

const PreorderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const { data: product, isLoading } = useProductBySlug(slug);

  usePageMeta({
    title: product?.name ? `${product.name} — Private Access` : "Private Access",
    description: product?.description ?? "Request private access to this RUVTIER garment.",
  });
  usePriceTick();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    country: "",
    size_preference: "",
    delivery_region: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const startedAtRef = useRef<number>(Date.now());

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) {
      // Silent acceptance — present a friendly success state.
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

    // Check current auth for user_id
    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from("preorder_requests" as any).insert({
      product_id: product?.id,
      product_name: product?.name || slug || "Unknown",
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
      if (dbError.code === "23505") {
        setError(FORM_ERRORS.duplicate);
      } else {
        setError(FORM_ERRORS.generic);
      }
      return;
    }

    setSubmitted(true);
  };

  const statement = (product as any)?.preorder_statement ||
    `${product?.name || "This piece"} is in quiet preparation.`;

  const inputClass =
    "w-full h-11 px-4 bg-transparent border border-border text-foreground text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors duration-300";
  const labelClass =
    "block text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2";

  if (isLoading) {
    return (
      <div className="relative">
        <Navigation />
        <section className="pt-20 md:pt-28 min-h-[80vh]">
          <div className="luxury-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="animate-pulse aspect-[3/4] bg-secondary" />
              <div className="animate-pulse space-y-4 pt-8">
                <div className="h-8 bg-secondary w-3/4" />
                <div className="h-4 bg-secondary w-1/2" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-20 md:pt-28 pb-20 md:pb-28 min-h-[85vh]">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
            {/* Left — Editorial Image */}
            <ScrollFadeIn>
              <div className="aspect-[3/4] bg-secondary overflow-hidden">
                <img
                  src={product?.hero_image_url || product?.thumbnail_url || garmentImage}
                  alt={product?.name || "Garment"}
                  className="w-full h-full object-cover"
                />
              </div>
            </ScrollFadeIn>

            {/* Right — Private Access Form */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ScrollFadeIn delay={0.12}>
                {/* Header */}
                <div className="mb-10">
                  <h1 className="font-serif font-light text-2xl md:text-3xl tracking-wide text-foreground mb-3">
                    {product?.name}
                  </h1>
                  <p className="text-sm text-muted-foreground tracking-wide leading-relaxed mb-4">
                    {statement}
                  </p>
                  {product?.price != null && (
                    <p className="text-muted-foreground text-base tracking-wide">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-8 mb-8">
                  <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-1">
                    Private access request
                  </p>
                  <p className="text-xs text-muted-foreground/70 tracking-wide">
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
                    {/* Honeypot */}
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
                      <label className={labelClass}>Preferred delivery region <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span></label>
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
                      <label className={labelClass}>Message <span className="normal-case tracking-normal text-muted-foreground/40">(optional)</span></label>
                      <textarea
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        className={`${inputClass} h-auto py-3`}
                        rows={3}
                        maxLength={500}
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 tracking-wide">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-foreground text-background text-xs tracking-[0.2em] uppercase transition-opacity duration-300 hover:opacity-80 disabled:opacity-40"
                    >
                      {submitting ? "Submitting..." : "Request access"}
                    </button>
                  </form>
                )}
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default PreorderPage;
