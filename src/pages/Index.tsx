import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import heroImage from "@/assets/hero-editorial.jpg";
import womenImage from "@/assets/collection-women.jpg";
import menImage from "@/assets/collection-men.jpg";
import materialImage from "@/assets/material-texture.jpg";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-[center_40%] md:bg-[center_35%]"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/55" />
        </div>
        <div className="relative z-10 text-center px-6 -mt-8 md:-mt-12">
          <ScrollFadeIn>
            <h1 className="luxury-heading-lg mb-5 uppercase">R U V T I E R</h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.2}>
            <p className="luxury-body mx-auto mb-10 text-center">
              Permanence in garment form
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.4}>
            <Link to="/collection" className="luxury-button">
              Explore the Collection
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Category Tiles — Women / Men */}
      <section className="luxury-section" style={{ paddingTop: "var(--hero-gap)" }}>
        <div className="luxury-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Women */}
            <Link to="/boutique/women" className="group relative block overflow-hidden aspect-[3/4]">
              <img
                src={garmentImage}
                alt="Women's collection by RUVTIER"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h2 className="font-serif font-light text-[clamp(22px,2.5vw,32px)] tracking-wider text-primary-foreground mb-1">
                  Women
                </h2>
                <span className="font-sans text-[11px] tracking-[0.14em] uppercase text-primary-foreground/70 group-hover:text-primary-foreground transition-colors duration-300">
                  Discover more
                </span>
              </div>
            </Link>

            {/* Men */}
            <Link to="/boutique/men" className="group relative block overflow-hidden aspect-[3/4]">
              <img
                src={materialImage}
                alt="Men's collection by RUVTIER"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-foreground/10 group-hover:bg-foreground/20 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <h2 className="font-serif font-light text-[clamp(22px,2.5vw,32px)] tracking-wider text-primary-foreground mb-1">
                  Men
                </h2>
                <span className="font-sans text-[11px] tracking-[0.14em] uppercase text-primary-foreground/70 group-hover:text-primary-foreground transition-colors duration-300">
                  Explore Mens
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Material is Memory */}
      <section className="luxury-section">
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${materialImage})` }}
          >
            <div className="absolute inset-0 bg-background/60" />
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
              "Every fabric carries origin, landscape, and time."
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
