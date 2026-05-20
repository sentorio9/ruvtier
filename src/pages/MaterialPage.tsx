/**
 * Material detail page (`/materials/:slug`).
 *
 * A single material treated as a subject — vicuña, cashmere, silk,
 * linen, denim. One descriptive paragraph in italic, one CTA back to
 * the index.
 *
 * Section order: Navigation · centred heading + italic description ·
 * "Explore all materials" link · LuxuryFooter.
 *
 * Design-system dependencies: `.luxury-container`, `.luxury-heading`,
 * `.luxury-body`, `.luxury-button`. Copy sourced from
 * `MATERIAL_DESCRIPTIONS` in `src/content/brand.ts`.
 */
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MATERIAL_DESCRIPTIONS, MATERIAL_FALLBACK_DESCRIPTION } from "@/content/brand";

const formatName = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const MaterialPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const name = formatName(slug || "");
  const description = MATERIAL_DESCRIPTIONS[slug || ""] || MATERIAL_FALLBACK_DESCRIPTION;
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
