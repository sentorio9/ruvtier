import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { useState } from "react";

const TheHousePage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      <article className="pt-40 pb-20 md:pt-48 md:pb-28">
        <div className="max-w-[620px] mx-auto px-6 md:px-8">

          {/* Section 1 — Intro */}
          <ScrollFadeIn>
            <section className="mb-20 md:mb-28">
              <p className="font-serif font-light text-[clamp(17px,1.4vw,20px)] leading-[1.9] text-foreground text-center">
                At Ruvtier, stillness is a discipline. It governs cut, material, proportion.
                <br />
                Silence is treated as material.
              </p>
            </section>
          </ScrollFadeIn>

          {/* Quote block — measured / protected / never filled */}
          <ScrollFadeIn delay={0.1}>
            <section className="mb-24 md:mb-32 flex flex-col items-center text-center gap-3">
              <span className="font-serif font-light text-[clamp(22px,2vw,28px)] leading-[1.5] italic text-foreground tracking-[0.06em]">
                measured.
              </span>
              <span className="font-serif font-light text-[clamp(22px,2vw,28px)] leading-[1.5] italic text-foreground tracking-[0.06em]">
                protected.
              </span>
              <span className="font-serif font-light text-[clamp(22px,2vw,28px)] leading-[1.5] italic text-foreground tracking-[0.06em]">
                never filled.
              </span>
            </section>
          </ScrollFadeIn>

          {/* Section 2 — Manifesto body */}
          <ScrollFadeIn delay={0.15}>
            <section className="mb-24 md:mb-32">
              <p className="font-sans font-light text-[clamp(15px,1.15vw,17px)] leading-[2] text-muted-foreground">
                Work proceeds without audience. Decisions are slow and final. What is unresolved is not released. Craft is continuity. Seams dissolve into structure. Weight is calibrated. Drape is held, not performed. Materials are refined until their presence becomes quiet, revealing themselves only through time and wear.
              </p>
            </section>
          </ScrollFadeIn>

          {/* Section 3 — Second statement block */}
          <ScrollFadeIn delay={0.1}>
            <section className="mb-24 md:mb-32 text-center">
              <p className="font-serif font-light text-[clamp(19px,1.6vw,24px)] leading-[1.8] italic text-foreground tracking-[0.04em]">
                Garments conceived between motion and rest.
                <br />
                Composed in movement.
                <br />
                Stable in stillness.
              </p>
            </section>
          </ScrollFadeIn>

          {/* Section 4 — Philosophy */}
          <ScrollFadeIn delay={0.15}>
            <section className="mb-24 md:mb-32">
              <p className="font-sans font-light text-[clamp(15px,1.15vw,17px)] leading-[2] text-muted-foreground">
                The house extends beyond clothing, dry scent, matte surface, spaces shaped by proportion, light, absence. Ruvtier is for those who recognize restraint without explanation, whose precision is a form of respect.
              </p>
            </section>
          </ScrollFadeIn>

          {/* Section 5 — Founder */}
          <ScrollFadeIn delay={0.1}>
            <section className="mb-28 md:mb-40 text-center">
              <p className="font-serif font-light text-[clamp(16px,1.3vw,19px)] leading-[1.9] text-foreground">
                Founded by Rexford Joon Valenttier.
                <br />
                He serves as custodian.
              </p>
            </section>
          </ScrollFadeIn>

          {/* Section 6 — Final statement */}
          <ScrollFadeIn delay={0.1}>
            <section className="mb-28 md:mb-40 text-center py-10 md:py-16">
              <p className="font-serif font-light text-[clamp(20px,1.8vw,26px)] leading-[1.7] italic text-foreground tracking-[0.05em]">
                Ruvtier does not persuade.
                <br />
                It remains.
              </p>
            </section>
          </ScrollFadeIn>

          {/* Social links */}
          <ScrollFadeIn delay={0.15}>
            <div className="flex items-center justify-center gap-10 mb-16 md:mb-20">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/ruvtier/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@ruvtier"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                <svg width="22" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="4" />
                  <polygon points="10,8.5 16,12 10,15.5" fill="none" stroke="currentColor" strokeWidth="0.6" />
                </svg>
              </a>

              {/* Pinterest */}
              <a
                href="https://uk.pinterest.com/RUVTIER/_created/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
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

export default TheHousePage;
