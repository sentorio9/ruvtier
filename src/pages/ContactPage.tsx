import { useState } from "react";
import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";

const ContactPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Contact from ${form.name}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    window.location.href = `mailto:theruvtier@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center max-w-xl mx-auto">
          <ScrollFadeIn>
            <h1 className="luxury-heading mb-10">Contact</h1>
          </ScrollFadeIn>

          {/* Contact details */}
          <ScrollFadeIn delay={0.1}>
            <div className="flex flex-col gap-4 mb-14">
              <a
                href="mailto:theruvtier@gmail.com"
                className="luxury-button !text-[13px] tracking-[0.1em]"
              >
                theruvtier@gmail.com
              </a>
              <a
                href="tel:+447881967338"
                className="luxury-button !text-[13px] tracking-[0.1em]"
              >
                +44 7881 967338
              </a>
              <a
                href="https://www.instagram.com/ruvtier"
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-button !text-[13px] tracking-[0.1em]"
              >
                Instagram
              </a>
            </div>
          </ScrollFadeIn>

          {/* Divider */}
          <ScrollFadeIn delay={0.15}>
            <div className="w-12 border-t border-border mb-14" />
          </ScrollFadeIn>

          {/* Contact form */}
          <ScrollFadeIn delay={0.2}>
            {submitted ? (
              <p className="luxury-body text-center">
                Thank you for reaching out. We will reply in due time.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 text-left">
                <div className="border-b border-foreground/20">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Name"
                    className="w-full bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
                <div className="border-b border-foreground/20">
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="Email"
                    className="w-full bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
                <div className="border-b border-foreground/20">
                  <textarea
                    required
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Message"
                    rows={4}
                    className="w-full bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none resize-none"
                  />
                </div>
                <button type="submit" className="luxury-button mt-2 self-start !text-[13px]">
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
