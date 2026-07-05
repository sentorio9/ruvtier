import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";

const FindBoutiquePage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Visiting the House",
    description: "RUVTIER does not maintain a public boutique. Visits are arranged privately in Palermo or by private video appointment.",
  });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-24 min-h-[80vh]">
        <div className="luxury-container max-w-[620px] mx-auto text-center">
          <ScrollFadeIn>
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
              By Appointment Only
            </p>
            <h1 className="luxury-heading mb-8">Visiting the House</h1>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.1}>
            <p className="font-serif italic text-foreground/80 text-lg leading-relaxed mb-6">
              The house does not maintain a public boutique.
            </p>
            <p className="luxury-body mb-10">
              Private appointments are arranged directly through RUVTIER — in our Palermo atelier or by private video. Each appointment is personal, unhurried, and reserved for one client at a time.
            </p>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.15}>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
              <Link to="/appointments" className="luxury-button !text-[12px] tracking-[0.2em]">
                Request an Appointment
              </Link>
              <a href="mailto:appointments@ruvtier.com" className="luxury-button !text-[12px] tracking-[0.2em]">
                appointments@ruvtier.com
              </a>
            </div>
            <p className="text-xs text-muted-foreground tracking-wide">
              Or write to{" "}
              <a href="mailto:contact@ruvtier.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
                contact@ruvtier.com
              </a>
              {" "}for general enquiries.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default FindBoutiquePage;
