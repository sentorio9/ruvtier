import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import heroImage from "@/assets/hero-editorial.jpg";
import womenImage from "@/assets/collection-women.jpg";
import menImage from "@/assets/collection-men.jpg";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_40%] md:bg-[center_35%]"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/40" />
        </div>
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
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[85svh] md:min-h-[90svh]">
        {/* Women */}
        <Link to="/boutique/women" className="group relative block overflow-hidden min-h-[60svh] md:min-h-0">
          <img
            src={womenImage}
            alt="Women's collection by RUVTIER"
            className="absolute inset-0 w-full h-full object-cover object-[center_25%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors duration-700" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h2 className="font-serif font-light text-[clamp(24px,3vw,38px)] tracking-[0.15em] text-primary-foreground mb-3 transition-transform duration-700 group-hover:-translate-y-1">
              Women's Collection
            </h2>
            <span className="font-sans text-[12px] tracking-[0.18em] uppercase text-primary-foreground/60 group-hover:text-primary-foreground transition-all duration-500">
              Discover More
            </span>
          </div>
        </Link>

        {/* Men */}
        <Link to="/boutique/men" className="group relative block overflow-hidden min-h-[60svh] md:min-h-0">
          <img
            src={menImage}
            alt="Men's collection by RUVTIER"
            className="absolute inset-0 w-full h-full object-cover object-[center_25%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors duration-700" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <h2 className="font-serif font-light text-[clamp(24px,3vw,38px)] tracking-[0.15em] text-primary-foreground mb-3 transition-transform duration-700 group-hover:-translate-y-1">
              Men's Collection
            </h2>
            <span className="font-sans text-[12px] tracking-[0.18em] uppercase text-primary-foreground/60 group-hover:text-primary-foreground transition-all duration-500">
              Explore Men's Collection
            </span>
          </div>
        </Link>
      </section>

      {/* Material is Memory — Video Section */}
      <section className="luxury-section">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/fabric-craft.mov" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-background/55" />
          </div>
          <div className="relative z-10 luxury-container flex flex-col items-center text-center py-28 md:py-40">
            <ScrollFadeIn>
              <h2 className="luxury-heading mb-6">Material is Memory</h2>
            </ScrollFadeIn>
            <ScrollFadeIn delay={0.15}>
              <Link to="/materials" className="luxury-button">
                Discover all material
              </Link>
            </ScrollFadeIn>
          </div>
        </div>
      </section>

      {/* Stillness / Philosophy */}
      <section className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <p className="luxury-body mx-auto mb-3 text-center italic">
              "Every fibre carries origin, landscape, and time."
            </p>
            <p className="luxury-body mx-auto mb-10 text-center italic">
              "We begin there, in silence."
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <Link to="/stillness" className="luxury-button">
              Enter Stillness
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Index;
