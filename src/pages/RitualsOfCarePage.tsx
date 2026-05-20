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

const sections = [
  {
    title: "Daily Handling",
    paragraphs: [
      "Allow each piece to breathe between wear.",
      "Time preserves what haste erodes.",
    ],
  },
  {
    title: "A Note on Time",
    paragraphs: [
      "Delicate changes in texture, softness, and drape are not flaws. They are the quiet record of a life well worn.",
      "What a piece becomes over time is part of its value.",
    ],
  },
  {
    title: "Cashmere & Baby Cashmere",
    paragraphs: [
      "Cashmere is among the most delicate fibres in the world, valued not for resilience, but for its quiet softness.",
      "After wear, allow the garment to rest. Air it gently, away from direct light, before returning it to your wardrobe.",
      "With considered care, cashmere softens, deepens, and becomes more personal with time.",
    ],
  },
  {
    title: "Silk",
    paragraphs: [
      "Silk responds to its environment with sensitivity. Light, movement, and touch all leave their trace.",
      "Avoid prolonged exposure to direct light, which may soften its tone. Contact with water, oils, or fragrance should remain minimal.",
      "After wear, allow the piece to rest and breathe before storing.",
      "Silk retains its beauty not through intervention, but through restraint.",
    ],
  },
  {
    title: "Leather",
    paragraphs: [
      "Leather is a living material. It evolves, developing a patina that reflects time, use, and touch.",
      "Avoid unnecessary friction or pressure that may alter its surface.",
      "When not in use, store in a dust bag, allowing the piece to maintain its shape and character.",
    ],
  },
];

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
              Rituals of Care
            </h1>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.1}>
            <p className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
              Respect for material defines how a RUVTIER piece is made and how it is kept.
            </p>
            <p className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
              A RUVTIER piece, when preserved with care, will outlast seasons and often, its first owner. Ownership is never absolute; each piece is held in stewardship.
            </p>
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
                RUVTIER Restoration
              </h2>
              <p className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
                RUVTIER pieces are created to remain.
              </p>
              <p className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
                Over time, should a piece require attention, it may be returned to the house for careful assessment and restoration.
              </p>
              <p className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
                Each restoration is approached individually. Subtle variations, developed through wear, are respected as part of the garment or object's history.
              </p>
              <p className="font-serif text-[15px] leading-[1.85] text-foreground/85 mb-4">
                For guidance, or to arrange a restoration, clients may contact the house directly.
              </p>
            </div>
          </ScrollFadeIn>

          {/* Closing statement */}
          <ScrollFadeIn delay={0.1 * (sections.length + 3)}>
            <div className="mt-14 md:mt-20 text-center">
              <p className="font-serif italic text-[15px] leading-[1.85] text-foreground/70">
                To restore a RUVTIER piece is not to make it new
                <br />
                but to allow it to continue.
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
