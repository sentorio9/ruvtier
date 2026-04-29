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
              <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                className="text-muted-foreground hover:text-foreground transition-colors duration-500">
                <svg width="22" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <polygon points="10,8.5 16,12 10,15.5" fill="none" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              </a>
              <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest"
                className="text-muted-foreground hover:text-foreground transition-colors duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 7c-3 0-5 2.2-5 4.8 0 1.8 1 3.2 2.6 3.2.4 0 .7-.4.5-1l-.3-1.2c-.1-.3 0-.6.2-.8.8-1 1.5-2.2 2-2.2 1.8 0 1.2 2.8 1.2 2.8s-.3 1.2-.5 2.2c-.2.8.5 1.5 1.3 1.5 2 0 3.3-2.5 3.3-5 0-2.5-2-4.3-4.3-4.3z" />
                </svg>
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
