import { useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import {
  honeypotInputProps,
  checkFormGuard,
  isValidEmail,
  FORM_ERRORS,
} from "@/lib/formProtection";

const ContactPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "Contact", description: "Reach the house of RUVTIER. Each correspondence is personal and considered." });
  const heading = useSiteText("contact_intro", "headline", "Contact");
  const email = useSiteText("contact_details", "email", "theruvtier@gmail.com");
  const phone = useSiteText("contact_details", "phone", "+44 7881 967338");
  const instagram = useSiteText("contact_details", "instagram_label", "Instagram");
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
    if (!guard.ok) {
      // Silent success — do not signal protection to bots.
      setSubmitted(true);
      return;
    }

    const name = form.name.trim();
    const message = form.message.trim();
    if (!name || !message) { setError(FORM_ERRORS.required); return; }
    if (name.length > 100 || message.length > 1500) { setError(FORM_ERRORS.tooLong); return; }
    if (!isValidEmail(form.email)) { setError(FORM_ERRORS.invalidEmail); return; }

    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${form.email.trim()}\n\n${message}`);
    window.location.href = `mailto:theruvtier@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-24">
        <div className="luxury-container flex flex-col items-center text-center max-w-xl mx-auto px-6">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="contact_intro" field="headline" label="Contact — heading" as="h1" className="luxury-heading mb-12">
              {heading}
            </Editable>
          </ScrollFadeIn>

          {/* Contact details */}
          <ScrollFadeIn delay={0.1}>
            <div className="flex flex-col gap-5 mb-16">
              <Editable kind="text_block" contentKey="contact_details" field="email" label="Contact — email" as="span" className="inline-block">
                <a href={`mailto:${email}`} className="luxury-button !text-[13px] tracking-[0.1em]">{email}</a>
              </Editable>
              <Editable kind="text_block" contentKey="contact_details" field="phone" label="Contact — phone" as="span" className="inline-block">
                <a href={`tel:${phone.replace(/\s+/g, "")}`} className="luxury-button !text-[13px] tracking-[0.1em]">{phone}</a>
              </Editable>
              <Editable kind="text_block" contentKey="contact_details" field="instagram_label" label="Contact — Instagram label" as="span" className="inline-block">
                <a href="https://www.instagram.com/ruvtier" target="_blank" rel="noopener noreferrer" className="luxury-button !text-[13px] tracking-[0.1em]">{instagram}</a>
              </Editable>
            </div>
          </ScrollFadeIn>

          {/* Divider */}
          <ScrollFadeIn delay={0.15}>
            <div className="w-10 border-t border-foreground/15 mb-16" />
          </ScrollFadeIn>

          {/* Contact form */}
          <ScrollFadeIn delay={0.2}>
            {submitted ? (
              <p className="luxury-body text-center">
                Thank you for reaching out. We will reply in due time.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10 text-left">
                <div className="relative border-b border-foreground/15 transition-colors duration-500 focus-within:border-foreground/50">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Name"
                    aria-label="Your name"
                    className="w-full bg-transparent pt-2 pb-3 font-sans text-[13px] tracking-[0.08em] placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
                <div className="relative border-b border-foreground/15 transition-colors duration-500 focus-within:border-foreground/50">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="Email"
                    aria-label="Your email address"
                    className="w-full bg-transparent pt-2 pb-3 font-sans text-[13px] tracking-[0.08em] placeholder:text-muted-foreground/40 focus:outline-none"
                  />
                </div>
                <div className="relative border-b border-foreground/15 transition-colors duration-500 focus-within:border-foreground/50">
                  <textarea
                    required
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Message"
                    aria-label="Your message"
                    rows={5}
                    className="w-full bg-transparent pt-2 pb-3 font-sans text-[13px] tracking-[0.08em] leading-relaxed placeholder:text-muted-foreground/40 focus:outline-none resize-none"
                  />
                </div>
                <button type="submit" className="luxury-button mt-4 self-start !text-[13px]">
                  Send
                </button>
              </form>
            )}
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default ContactPage;
