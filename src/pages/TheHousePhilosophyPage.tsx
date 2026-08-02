/**
 * The House — Philosophy / Manifesto page.
 *
 * A single narrow column of serif paragraphs read as one slow
 * statement of intent. No imagery. The page closes on the italic line
 * `Ruvtier does not persuade. It remains.`
 *
 * Section order:
 *   1. Navigation.
 *   2. Manifesto paragraphs (Discipline → Craft → Garments →
 *      Philosophy → Founder → Closing).
 *   3. Social links row.
 *   4. LuxuryFooter.
 *
 * Design-system dependencies: serif body at clamp(16px,1.25vw,19px)
 * with 2.0 leading; tracking `0.32em` on the social microtype;
 * `<Editable>` wrappers source fallbacks from
 * `HOUSE_MANIFESTO` in `src/content/brand.ts`.
 */
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import { HOUSE_MANIFESTO } from "@/content/brand";

const PARAGRAPHS: { key: string; label: string; fallback: string; closing?: boolean }[] = [
  { key: "discipline", label: "Manifesto — Discipline", fallback: HOUSE_MANIFESTO.discipline },
  { key: "craft", label: "Manifesto — Craft", fallback: HOUSE_MANIFESTO.craft },
  { key: "garments", label: "Manifesto — Garments", fallback: HOUSE_MANIFESTO.garments },
  { key: "philosophy", label: "Manifesto — Philosophy", fallback: HOUSE_MANIFESTO.philosophy },
  { key: "founder", label: "Manifesto — Founder", fallback: HOUSE_MANIFESTO.founder },
  { key: "closing", label: "Manifesto — Closing", fallback: HOUSE_MANIFESTO.closing, closing: true },
];

const TheHousePhilosophyPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "Philosophy — The House", description: "The philosophy, craft, and quiet conviction behind RUVTIER." });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-40 pb-20 md:pt-48 md:pb-28">
        <div className="max-w-[620px] mx-auto px-6 md:px-8">
          <div className="text-center mb-14 md:mb-20">
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
              The House · Atelier Palermo
            </p>
            <h1 className="luxury-heading">Philosophy</h1>
          </div>

          {PARAGRAPHS.map((p, i) => (
            <ManifestoParagraph key={p.key} index={i} para={p} />
          ))}

          {/* Founder credit */}
          <div className="text-center mb-14 md:mb-20">
            <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-3">
              Founder
            </p>
            <p className="font-serif text-lg text-foreground/90">
              Rexford Joon Valenttier
            </p>
            <p className="font-sans text-[11px] tracking-[0.12em] text-muted-foreground mt-1">
              Custodian of the house
            </p>
          </div>

          {/* Closing CTAs */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-16 md:mb-20 pt-8 border-t border-border">
            <Link to="/the-house/stay" className="luxury-button !text-[12px] tracking-[0.2em]">
              Visit the House
            </Link>
            <Link to="/collection" className="luxury-button !text-[12px] tracking-[0.2em]">
              Explore The Collection
            </Link>
            <Link to="/journal" className="luxury-button !text-[12px] tracking-[0.2em]">
              Read the Journal
            </Link>
          </div>

          {/* Social links */}
          <ScrollFadeIn delay={0.15}>
            <div className="flex items-center justify-center gap-10 mb-16 md:mb-20">
              <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer"
                className="font-sans text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500">
                Instagram
              </a>
              <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer"
                className="font-sans text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500">
                YouTube
              </a>
              <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer"
                className="font-sans text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500">
                Pinterest
              </a>
            </div>
          </ScrollFadeIn>
        </div>
      </article>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

function ManifestoParagraph({ para, index }: { para: typeof PARAGRAPHS[number]; index: number }) {
  const value = useSiteText(`house_${para.key}`, "body", para.fallback);
  return (
    <ScrollFadeIn delay={index === 0 ? 0 : 0.1}>
      <section className={para.closing ? "mb-20 md:mb-28" : "mb-12 md:mb-16"}>
        <Editable
          kind="text_block"
          contentKey={`house_${para.key}`}
          field="body"
          label={para.label}
          as="p"
          className="font-serif font-light text-[clamp(16px,1.25vw,19px)] leading-[2] text-foreground"
        >
          {value}
        </Editable>
      </section>
    </ScrollFadeIn>
  );
}

export default TheHousePhilosophyPage;
