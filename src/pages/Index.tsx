import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";

import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import heroImage from "@/assets/hero-editorial.jpg";
import womenImage from "@/assets/collection-women.jpg";
import menImage from "@/assets/collection-men.jpg";
import knitwearImg from "@/assets/explore-knitwear.jpg";
import lifestyleImg from "@/assets/explore-lifestyle.jpg";
import appointmentImg from "@/assets/explore-appointment.png";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "RUVTIER", description: "A luxury fashion house devoted to permanence, material origin, and the quiet art of garment composition." });

  return (
    <div className="relative">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="RUVTIER luxury garment editorial"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%] md:object-[center_35%]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="relative z-10 text-center px-6 -mt-8 md:-mt-12">
          <ScrollFadeIn>
            <p className="font-serif font-light text-[clamp(20px,2.2vw,28px)] leading-[1.7] tracking-[0.08em] text-foreground mx-auto max-w-[var(--text-max)]">
              Permanence in garment form
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Link to="/collection" className="luxury-button mt-10 inline-block">
              Explore the Collection
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Split Collection — Women / Men */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 py-16 md:py-24 luxury-container">
        {/* Women */}
        <ScrollFadeIn>
          <Link to="/boutique/women" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-[3/4] overflow-hidden mb-5">
              <img
                src={womenImage}
                alt="Women's collection by RUVTIER"
                className="w-full h-full object-cover object-[center_25%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
            <h2 className="font-serif font-light text-[clamp(18px,1.8vw,24px)] tracking-[0.12em] text-foreground mb-2">
              Women's Collection
            </h2>
            <span className="font-sans text-[11px] tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition-colors duration-500">
              Discover More
            </span>
          </Link>
        </ScrollFadeIn>

        {/* Men */}
        <ScrollFadeIn delay={0.1}>
          <Link to="/boutique/men" className="group flex flex-col items-center text-center">
            <div className="w-full aspect-[3/4] overflow-hidden mb-5">
              <img
                src={menImage}
                alt="Men's collection by RUVTIER"
                className="w-full h-full object-cover object-[center_25%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
            <h2 className="font-serif font-light text-[clamp(18px,1.8vw,24px)] tracking-[0.12em] text-foreground mb-2">
              Men's Collection
            </h2>
            <span className="font-sans text-[11px] tracking-[0.18em] text-muted-foreground group-hover:text-foreground transition-colors duration-500">
              Explore Collection
            </span>
          </Link>
        </ScrollFadeIn>
      </section>

      {/* Material is Memory — Static Section (video disabled) */}
      <section className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center py-28 md:py-40">
          <ScrollFadeIn>
            <h2 className="luxury-heading mb-6">Material is Memory</h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <Link to="/materials" className="luxury-button">
              Discover all material
            </Link>
          </ScrollFadeIn>
        </div>
      </section>


      {/* In Your Keeping — Explore Section */}
      <section className="py-16 md:py-24">
        <div className="luxury-container">
          <ScrollFadeIn>
            <h2 className="font-serif font-light text-[clamp(18px,1.6vw,22px)] tracking-[0.15em] text-foreground text-center mb-10 md:mb-14">
              In Your Keeping
            </h2>
          </ScrollFadeIn>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-10 items-start">
            {[
              { img: knitwearImg, label: "Knitwear", to: "/boutique/women", imgClass: "h-[90%] w-[90%] translate-y-[15%]" },
              { img: lifestyleImg, label: "Life in RUVTIER", to: "/boutique/lifestyle", imgClass: "h-full w-full" },
              { img: appointmentImg, label: "By Appointment Only", to: "/contact", imgClass: "h-full w-full" },
            ].map((item, i) => (
              <ScrollFadeIn key={item.label} delay={i * 0.08}>
                <Link
                  to={item.to}
                  className="group grid h-full grid-rows-[auto_auto_auto] content-start justify-items-center gap-0 text-center"
                >
                  <div className="flex w-full aspect-[4/5] items-center justify-center overflow-hidden bg-background px-[10%] py-[10%]">
                    <img
                      src={item.img}
                      alt={item.label}
                      loading="lazy"
                      className={`object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02] ${item.imgClass}`}
                    />
                  </div>
                  <h3 className="mt-6 min-h-[2.75rem] self-start font-serif text-[clamp(15px,1.4vw,18px)] font-light tracking-[0.12em] text-foreground flex items-start justify-center text-center leading-[1.35] md:min-h-[3rem]">
                    {item.label}
                  </h3>
                  <span className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-500 group-hover:text-foreground">
                    Explore
                  </span>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Index;
