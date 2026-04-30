import { useState, ReactNode } from "react";
import Navigation from "@/components/Navigation";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { usePageMeta } from "@/hooks/usePageMeta";

export interface LegalSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

interface LegalPageProps {
  title: string;
  metaDescription: string;
  lastUpdated?: string;
  intro?: ReactNode;
  sections: LegalSection[];
}

const LegalPage = ({ title, metaDescription, lastUpdated, intro, sections }: LegalPageProps) => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title, description: metaDescription });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-40 pb-20 md:pt-48 md:pb-28 min-h-[80vh]">
        <div className="max-w-[720px] mx-auto px-6 md:px-8">
          <ScrollFadeIn>
            <header className="mb-14 md:mb-20 text-center">
              <h1 className="font-serif font-light text-[clamp(28px,3.6vw,44px)] leading-[1.15] tracking-[0.02em] text-foreground">
                {title}
              </h1>
              {lastUpdated && (
                <p className="mt-6 font-sans text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80">
                  Last updated · {lastUpdated}
                </p>
              )}
            </header>
          </ScrollFadeIn>

          {intro && (
            <ScrollFadeIn delay={0.05}>
              <div className="mb-12 md:mb-16 font-serif font-light text-[clamp(15px,1.15vw,17px)] leading-[1.95] text-foreground">
                {intro}
              </div>
            </ScrollFadeIn>
          )}

          <div className="space-y-10 md:space-y-14">
            {sections.map((section, i) => (
              <ScrollFadeIn key={i} delay={0.05}>
                <section>
                  {section.heading && (
                    <h2 className="font-serif font-light text-[clamp(17px,1.4vw,21px)] tracking-[0.04em] text-foreground mb-5">
                      {section.heading}
                    </h2>
                  )}
                  {section.paragraphs?.map((p, j) => (
                    <p
                      key={j}
                      className="font-sans font-light text-[14px] md:text-[15px] leading-[1.95] text-foreground/85 mb-4 last:mb-0"
                    >
                      {p}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="mt-3 space-y-2">
                      {section.list.map((item, j) => (
                        <li
                          key={j}
                          className="font-sans font-light text-[14px] md:text-[15px] leading-[1.85] text-foreground/85 pl-5 relative before:content-['—'] before:absolute before:left-0 before:text-muted-foreground/60"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </ScrollFadeIn>
            ))}

            <ScrollFadeIn delay={0.05}>
              <p className="mt-16 pt-8 border-t border-border font-sans text-[11px] tracking-[0.18em] uppercase text-muted-foreground/70 text-center leading-[1.8]">
                This document is currently provided as a working policy while RUVTIER operates in
                preorder and appointment mode. It is subject to legal review before full commercial launch.
              </p>
            </ScrollFadeIn>
          </div>
        </div>
      </article>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default LegalPage;
