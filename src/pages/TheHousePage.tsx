/**
 * The House — manifesto page.
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
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";

const PARAGRAPHS: { key: string; label: string; fallback: string; closing?: boolean }[] = [
  { key: "discipline", label: "Manifesto — Discipline", fallback: "At Ruvtier, stillness is a discipline. It governs cut, material, proportion. Silence is treated as material — measured, protected, never filled." },
  { key: "craft", label: "Manifesto — Craft", fallback: "Work proceeds without audience. Decisions are slow and final. What is unresolved is not released. Craft is continuity. Seams dissolve into structure. Weight is calibrated. Drape is held, not performed. Materials are refined until their presence becomes quiet, revealing themselves only through time and wear." },
  { key: "garments", label: "Manifesto — Garments", fallback: "Garments conceived between motion and rest. Composed in movement. Stable in stillness." },
  { key: "philosophy", label: "Manifesto — Philosophy", fallback: "The house extends beyond clothing — dry scent, matte surface, spaces shaped by proportion, light, absence. Ruvtier is for those who recognize restraint without explanation, whose precision is a form of respect." },
  { key: "founder", label: "Manifesto — Founder", fallback: "Founded by Rexford Joon Valenttier. He serves as custodian." },
  { key: "closing", label: "Manifesto — Closing", fallback: "Ruvtier does not persuade. It remains.", closing: true },
];

const TheHousePage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "The House", description: "The philosophy, craft, and quiet conviction behind RUVTIER." });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-40 pb-20 md:pt-48 md:pb-28">
        <div className="max-w-[620px] mx-auto px-6 md:px-8">
          {PARAGRAPHS.map((p, i) => (
            <ManifestoParagraph key={p.key} index={i} para={p} />
          ))}

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

export default TheHousePage;
