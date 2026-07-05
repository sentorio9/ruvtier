/**
 * Contact — quiet correspondence with the house.
 *
 * Presents four labelled correspondence channels — General, Client
 * services, Private appointments, Private client — plus a phone number
 * and a guarded message form.
 */
import { useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";

const CHANNELS = [
  { label: "General enquiries", email: "contact@ruvtier.com" },
  { label: "Client services", email: "clientservices@ruvtier.com" },
  { label: "Private appointments", email: "appointments@ruvtier.com" },
  { label: "Private client", email: "private@ruvtier.com" },
] as const;

const ContactPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Contact",
    description: "Reach the house of RUVTIER. Each correspondence is personal and considered — general enquiries, client services, appointments, and private client care.",
  });
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [honeypot, setHoneypot] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const guard = checkFormGuard({ honeypot, startedAt: startedAtRef.current });
    if (!guard.ok) { setSubmitted(true); return; }

    const name = form.name.trim();
    const message = form.message.trim();
    if (!name || !message) { setError(FORM_ERRORS.required); return; }
    if (name.length > 100 || message.length > 1500) { setError(FORM_ERRORS.tooLong); return; }
    if (!isValidEmail(form.email)) { setError(FORM_ERRORS.invalidEmail); return; }

    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${form.email.trim()}\n\n${message}`);
    window.location.href = `mailto:contact@ruvtier.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-24">
        <div className="luxury-container max-w-[820px] mx-auto px-6">
          <ScrollFadeIn>
            <div className="text-center mb-14 md:mb-20">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                Correspondence
              </p>
              <h1 className="luxury-heading mb-6">Contact</h1>
              <p className="luxury-body mx-auto max-w-[480px]">
                Each correspondence is personal and considered. Write to the channel best suited to your enquiry.
              </p>
            </div>
          </ScrollFadeIn>

          {/* Labelled contact channels */}
          <ScrollFadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-10 mb-14 md:mb-20 max-w-[620px] mx-auto">
              {CHANNELS.map((c) => (
                <div key={c.email}>
                  <p className="font-sans text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2">
                    {c.label}
                  </p>
                  <a href={`mailto:${c.email}`} className="font-serif text-[15px] text-foreground hover:text-foreground/70 underline-offset-4 hover:underline transition-colors">
                    {c.email}
                  </a>
                </div>
              ))}
            </div>
          </ScrollFadeIn>

          {/* Phone + Instagram */}
          <ScrollFadeIn delay={0.15}>
            <div className="text-center mb-14 md:mb-20 border-t border-b border-border py-8">
              <p className="font-sans text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-3">
                By telephone
              </p>
              <a href="tel:+447881967338" className="font-serif text-lg text-foreground hover:text-foreground/70 transition-colors block mb-4">
                +44 7881 967338
              </a>
              <a
                href="https://www.instagram.com/ruvtier"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Instagram
              </a>
            </div>
          </ScrollFadeIn>

          {/* Form */}
          <ScrollFadeIn delay={0.2}>
            <div className="max-w-[560px] mx-auto">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-8 text-center">
                Or write a note
              </p>
              {submitted ? (
                <p className="luxury-body text-center">
                  Thank you for reaching out. We will reply in due time.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-10 text-left">
                  <input {...honeypotInputProps} value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
                  <div className="relative border-b border-foreground/15 transition-colors duration-500 focus-within:border-foreground/50">
                    <input type="text" required maxLength={100} value={form.name} onChange={handleChange("name")}
                      placeholder="Name" aria-label="Your name"
                      className="w-full bg-transparent pt-2 pb-3 font-sans text-[13px] tracking-[0.08em] placeholder:text-muted-foreground/70 focus:outline-none" />
                  </div>
                  <div className="relative border-b border-foreground/15 transition-colors duration-500 focus-within:border-foreground/50">
                    <input type="email" required maxLength={255} value={form.email} onChange={handleChange("email")}
                      placeholder="Email" aria-label="Your email address"
                      className="w-full bg-transparent pt-2 pb-3 font-sans text-[13px] tracking-[0.08em] placeholder:text-muted-foreground/70 focus:outline-none" />
                  </div>
                  <div className="relative border-b border-foreground/15 transition-colors duration-500 focus-within:border-foreground/50">
                    <textarea required maxLength={1500} value={form.message} onChange={handleChange("message")}
                      placeholder="Message" aria-label="Your message" rows={5}
                      className="w-full bg-transparent pt-2 pb-3 font-sans text-[13px] tracking-[0.08em] leading-relaxed placeholder:text-muted-foreground/70 focus:outline-none resize-none" />
                  </div>
                  {error && <p role="alert" className="text-[12px] text-muted-foreground tracking-wide">{error}</p>}
                  <button type="submit" className="luxury-button mt-4 self-start !text-[13px]">
                    Send
                  </button>
                </form>
              )}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default ContactPage;
