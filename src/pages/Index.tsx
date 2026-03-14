import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import heroImage from "@/assets/hero-editorial.jpg";
import garmentImage from "@/assets/garment-single.jpg";
import materialImage from "@/assets/material-texture.jpg";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      {/* Section 1 — Arrival */}
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
              Enter
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Section 2 — First Garment */}
      <section id="garment" className="luxury-section" style={{ paddingTop: "var(--hero-gap)" }}>
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <div className="w-full max-w-lg mb-12">
              <img
                src={garmentImage}
                alt="First garment by RUVTIER"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto italic mb-8">
              "The first garments are in quiet preparation."
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Link to="/collection" className="luxury-button">
              Discover
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Section 3 — Material */}
      <section id="material" className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <div className="w-full max-w-3xl mb-12 overflow-hidden">
              <img
                src={materialImage}
                alt="Luxury fabric texture"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <h2 className="luxury-heading mb-6">Material is memory.</h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Link to="/materials" className="luxury-button">
              Explore by material
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Section 4 — Philosophy */}
      <section id="philosophy" className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <p className="luxury-body mx-auto mb-8 text-center italic">
              "Every fibre carries origin, landscape, and time.
              <br />
              We begin there, in silence."
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
