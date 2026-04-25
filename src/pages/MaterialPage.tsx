import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const materialDescriptions: Record<string, string> = {
  vicuna: "The rarest fibre on earth, gathered once a year from the high Andes. A material that carries silence in its warmth.",
  cashmere: "Gathered from the underfleece of highland goats. A fabric that remembers the cold and answers with gentleness.",
  "merino-wool": "Fine-gauge merino, bred for softness beyond measure. Each fibre a quiet act of precision.",
  silk: "A filament born from stillness. Silk carries light the way memory carries time.",
  "french-linen": "Grown in the fields of Normandy. Linen that softens with every season, never losing its character.",
  denim: "Selvedge denim woven on heritage shuttle looms. A weight that earns its memory through wear, fading into the rhythm of a life.",
};

const formatName = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const MaterialPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const name = formatName(slug || "");
  const description = materialDescriptions[slug || ""] || "The first pieces are in quiet preparation.";
  usePageMeta({ title: name || "Material", description: `RUVTIER ${name} — ${description}` });

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <h1 className="luxury-heading mb-6">{name}</h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto mb-10 text-center italic">{description}</p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Link to="/materials" className="luxury-button">
              Explore all materials
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default MaterialPage;
