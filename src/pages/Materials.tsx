/**
 * Materials index (`/materials`).
 *
 * Index of every house material. Opens with the editorial line
 * `Material is memory`, then lists each fibre as a quiet link.
 *
 * Section order: Navigation · headline + intro · material list ·
 * LuxuryFooter.
 *
 * Design-system dependencies: `.luxury-container`, `.luxury-heading`,
 * `.luxury-body`, `.hero-glow`. Copy fallbacks mirror `MATERIALS_INTRO`
 * in `src/content/brand.ts`.
 */
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import { MATERIALS_INTRO } from "@/content/brand";

const materials = [
  { name: "Vicuña", slug: "vicuna" },
  { name: "Cashmere", slug: "cashmere" },
  { name: "Merino Wool", slug: "merino-wool" },
  { name: "Silk", slug: "silk" },
  { name: "French Linen", slug: "french-linen" },
  { name: "Denim", slug: "denim" },
];

const Materials = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "Materials", description: "Each fibre begins as landscape. We honour that origin — vicuña, cashmere, silk, linen." });
  const heading = useSiteText("materials_intro", "headline", MATERIALS_INTRO.headline);
  const body = useSiteText("materials_intro", "body", MATERIALS_INTRO.body);

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <div className="hero-glow inline-block">
              <Editable kind="text_block" contentKey="materials_intro" field="headline" label="Materials — heading" as="h1" className="hero-title luxury-heading mb-6">
                {heading}
              </Editable>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <Editable kind="text_block" contentKey="materials_intro" field="body" label="Materials — intro" as="p" className="luxury-body mx-auto mb-12 text-center">
              {body}
            </Editable>
          </ScrollFadeIn>
          <div className="flex flex-col gap-6">
            {materials.map((m, i) => (
              <ScrollFadeIn key={m.slug} delay={0.2 + i * 0.08}>
                <Link to={`/materials/${m.slug}`} className="luxury-button type-subtitle">
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
