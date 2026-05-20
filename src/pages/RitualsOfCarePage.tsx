/**
 * Rituals of Care & Restoration.
 *
 * The house voice at its most instructive — guidance on how a RUVTIER
 * piece is kept, written so each paragraph reads as a quiet rule.
 *
 * Section order:
 *   1. Navigation.
 *   2. Heading + two intro paragraphs.
 *   3. Five care sections (Daily Handling → Time → Cashmere → Silk →
 *      Leather).
 *   4. RUVTIER Restoration block.
 *   5. Italic closing line.
 *   6. LuxuryFooter.
 *
 * Design-system dependencies: narrow `max-w-[620px]` column, serif
 * body at 15px / 1.85 leading; copy mirrors `RITUALS_*` exports in
 * `src/content/brand.ts`.
 */
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import {
  RITUALS_HEADING,
  RITUALS_INTRO_PARAGRAPHS,
  RITUALS_SECTIONS,
  RITUALS_RESTORATION,
  CLOSING_LINES,
} from "@/content/brand";

const sections = RITUALS_SECTIONS;

const RitualsOfCarePage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Rituals of Care & Restoration",
    description: "Respect for material defines how a RUVTIER piece is made and how it is kept.",
  });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-32 pb-20 md:pb-28">
        <div className="max-w-[620px] mx-auto px-6">
          {/* Header */}
          <ScrollFadeIn>
            <h1 className="font-serif font-light text-[clamp(26px,3vw,36px)] tracking-[0.04em] text-foreground mb-8">
              {RITUALS_HEADING}
            </h1>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.1}>
            {RITUALS_INTRO_PARAGRAPHS.map((p, i) => (
              <p key={i} className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
                {p}
              </p>
            ))}
          </ScrollFadeIn>

          {/* Care sections */}
          {sections.map((section, i) => (
            <ScrollFadeIn key={section.title} delay={0.1 * (i + 2)}>
              <div className="mt-12 md:mt-16">
                <h2 className="font-serif font-light text-[clamp(18px,2vw,22px)] tracking-[0.03em] text-foreground mb-5">
                  {section.title}
                </h2>
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </ScrollFadeIn>
          ))}

          {/* Restoration */}
          <ScrollFadeIn delay={0.1 * (sections.length + 2)}>
            <div className="mt-16 md:mt-20">
              <h2 className="font-serif font-light text-[clamp(20px,2.2vw,26px)] tracking-[0.03em] text-foreground mb-5">
                {RITUALS_RESTORATION.heading}
              </h2>
              {RITUALS_RESTORATION.paragraphs.map((p, i) => (
                <p key={i} className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
                  {p}
                </p>
              ))}
            </div>
          </ScrollFadeIn>

          {/* Closing statement */}
          <ScrollFadeIn delay={0.1 * (sections.length + 3)}>
            <div className="mt-14 md:mt-20 text-center">
              <p className="font-serif italic text-[15px] leading-[1.85] text-foreground/70">
                {CLOSING_LINES.rituals.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </ScrollFadeIn>

        </div>
      </article>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default RitualsOfCarePage;
