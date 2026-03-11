import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { useState } from "react";
import { Link } from "react-router-dom";

const materials = [
  { name: "Vicuña", slug: "vicuna" },
  { name: "Cashmere", slug: "cashmere" },
  { name: "Merino Wool", slug: "merino-wool" },
  { name: "Silk", slug: "silk" },
  { name: "French Linen", slug: "french-linen" },
];

const Materials = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <h1 className="luxury-heading mb-6">Material is memory</h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto mb-12 text-center">
              Each fibre begins as landscape. We honour that origin.
            </p>
          </ScrollFadeIn>
          <div className="flex flex-col gap-6">
            {materials.map((m, i) => (
              <ScrollFadeIn key={m.slug} delay={0.2 + i * 0.08}>
                <Link to={`/materials/${m.slug}`} className="luxury-button !text-[clamp(16px,1.5vw,20px)] font-serif font-light tracking-wider">
                  {m.name}
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

export default Materials;
