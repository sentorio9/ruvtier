import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import heroImage from "@/assets/hero-editorial.jpg";
import garmentImage from "@/assets/garment-single.jpg";
import materialImage from "@/assets/material-texture.jpg";

const Index = () => {
  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      {/* Section 1 — Arrival */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-background/60" />
        </div>
        <div className="relative z-10 text-center px-6">
          <ScrollFadeIn>
            <h1 className="luxury-heading-lg mb-6">R U V T I E R</h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.2}>
            <p className="luxury-body mx-auto mb-8 text-center">
              Permanence in garment form
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.4}>
            <a href="#garment" className="luxury-button">
              Enter
            </a>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Section 2 — First Garment */}
      <section id="garment" className="luxury-section" style={{ paddingTop: "180px" }}>
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
            <a href="#material" className="luxury-button">
              Discover
            </a>
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
            <a href="#philosophy" className="luxury-button">
              Explore by material
            </a>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Section 4 — Philosophy */}
      <section id="philosophy" className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <h2 className="luxury-heading-lg mb-8">Stillness</h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto mb-8 text-center">
              Every fibre carries origin, landscape, and time.
              <br />
              We begin there, in silence.
            </p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <a href="#" className="luxury-button">
              Enter Stillness
            </a>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Footer */}
      <LuxuryFooter />
    </div>
  );
};

export default Index;
