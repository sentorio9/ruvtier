import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

const STEPS = [
  {
    title: "Consultation",
    body: "An unhurried conversation — in person in Palermo or by private video call. We listen for silhouette, purpose, and the life the garment will accompany.",
  },
  {
    title: "Fabric selection",
    body: "A curated presentation of cashmere, silk, wool and linen from our chosen mills. Each cloth is discussed for weight, drape, season, and character.",
  },
  {
    title: "Measurements",
    body: "Measurements are taken with quiet precision and recorded to your personal client file, held privately by the house.",
  },
  {
    title: "Fittings",
    body: "One to two fittings, timed to the piece. Every seam is refined until the garment answers to your movement rather than merely fitting your form.",
  },
];

const MadeToMeasurePage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Made-to-Measure",
    description: "RUVTIER Made-to-Measure — a private service composed around the wearer. Consultation, fabric selection, measurements and fittings arranged by appointment in the Palermo atelier or by private video.",
  });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-16 md:pb-20">
        <div className="luxury-container max-w-[820px] mx-auto">
          <Breadcrumbs items={[
            { label: "Home", to: "/" },
            { label: "Boutique", to: "/boutique" },
            { label: "Made-to-Measure" },
          ]} />

          <ScrollFadeIn>
            <div className="text-center mb-14 md:mb-20">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                A Private Service
              </p>
              <h1 className="luxury-heading mb-6">Made-to-Measure</h1>
              <p className="luxury-body mx-auto max-w-[560px]">
                Composed around the wearer, over time. Each piece is considered privately, in correspondence and in fitting, until it becomes indistinguishable from the life it accompanies.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="space-y-14 md:space-y-20 mb-20">
            {STEPS.map((s, i) => (
              <ScrollFadeIn key={s.title} delay={i * 0.05}>
                <div className="grid grid-cols-[auto_1fr] gap-6 md:gap-10">
                  <div className="font-serif font-light text-[clamp(24px,3vw,32px)] text-foreground/40 leading-none w-14 md:w-20">
                    0{i + 1}
                  </div>
                  <div>
                    <h2 className="font-serif font-light text-[clamp(20px,1.8vw,26px)] tracking-[0.04em] text-foreground mb-4">
                      {s.title}
                    </h2>
                    <p className="font-sans font-light text-[15px] leading-[1.9] text-foreground/80 max-w-[520px]">
                      {s.body}
                    </p>
                  </div>
                </div>
              </ScrollFadeIn>
            ))}
          </div>

          <ScrollFadeIn>
            <div className="border-t border-border pt-12 md:pt-16 text-center">
              <p className="font-serif italic text-foreground/80 text-lg mb-8 max-w-[480px] mx-auto leading-relaxed">
                Delivery timelines are personal to each piece and confirmed in the initial consultation.
              </p>
              <Link
                to="/appointments?type=made_to_measure"
                className="inline-block px-10 py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase transition-opacity duration-300 hover:opacity-80"
              >
                Book a Made-to-Measure Appointment
              </Link>
              <p className="text-xs text-muted-foreground tracking-wide mt-6">
                Or write to{" "}
                <a href="mailto:appointments@ruvtier.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
                  appointments@ruvtier.com
                </a>
              </p>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default MadeToMeasurePage;
