import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";

const Stillness = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Stillness and Craft",
    description: "On the discipline of restraint. Every fibre carries origin, landscape, and time. We begin there, in silence.",
    ogType: "article",
  });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="max-w-[640px] mx-auto px-6 md:px-8">
          <ScrollFadeIn>
            <header className="text-center mb-14 md:mb-20">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                Journal · Nº 01
              </p>
              <h1 className="luxury-heading mb-6">Stillness and Craft</h1>
              <p className="font-serif italic text-foreground/70 text-base leading-relaxed">
                On the discipline of restraint.
              </p>
            </header>
          </ScrollFadeIn>

          <div className="space-y-10 md:space-y-14">
            <ScrollFadeIn delay={0.05}>
              <section>
                <h2 className="font-serif font-light text-[clamp(20px,1.8vw,26px)] tracking-[0.02em] text-foreground mb-5">
                  Silence, treated as material
                </h2>
                <p className="font-sans font-light text-[15px] md:text-[16px] leading-[2] text-foreground/85">
                  At RUVTIER, stillness is not aesthetic. It is a discipline that governs cut, material, and proportion. Silence is treated as material — measured, protected, never filled. Work proceeds without audience. Decisions are slow and final. What is unresolved is not released.
                </p>
              </section>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.05}>
              <section>
                <h2 className="font-serif font-light text-[clamp(20px,1.8vw,26px)] tracking-[0.02em] text-foreground mb-5">
                  Every fibre carries origin
                </h2>
                <p className="font-sans font-light text-[15px] md:text-[16px] leading-[2] text-foreground/85">
                  Cashmere remembers cold. Silk carries light. Linen answers to seasons. Wool holds structure through time. We begin at the fibre and we begin in silence — refusing to treat material as decoration, refusing to treat garments as noise.
                </p>
              </section>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.05}>
              <section>
                <h2 className="font-serif font-light text-[clamp(20px,1.8vw,26px)] tracking-[0.02em] text-foreground mb-5">
                  A garment that outlasts its moment
                </h2>
                <p className="font-sans font-light text-[15px] md:text-[16px] leading-[2] text-foreground/85">
                  We make few things, slowly, and only once. Each piece is composed in movement and stable in stillness. Seams dissolve into structure. Weight is calibrated. Drape is held, not performed. What we release is intended to remain — to soften with wear, to accompany a life.
                </p>
              </section>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.1}>
              <p className="font-serif italic text-foreground/80 text-lg md:text-xl leading-relaxed text-center pt-8 border-t border-border">
                Every fibre carries origin, landscape, and time.<br />
                We begin there, in silence.
              </p>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.15}>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 pt-8">
                <Link to="/journal" className="luxury-button !text-[12px] tracking-[0.2em]">
                  Return to Journal
                </Link>
                <Link to="/collection" className="luxury-button !text-[12px] tracking-[0.2em]">
                  Explore The Collection
                </Link>
              </div>
            </ScrollFadeIn>
          </div>
        </div>
      </article>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Stillness;
