/**
 * RUVTIER Stay — invitation-led house visit experience page.
 *
 * Presents the eight experiences available during a visit to the
 * RUVTIER headquarters, followed by the house-visit booking form.
 */
import { useState } from "react";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import HouseVisitBookingForm from "@/components/HouseVisitBookingForm";
import { usePageMeta } from "@/hooks/usePageMeta";
import { HOUSE_STAY } from "@/content/brand";

const EXPERIENCES = HOUSE_STAY.experiences;

const TheHouseStayPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "RUVTIER Stay — Visit the House",
    description: "An invitation-led visit to the RUVTIER headquarters. Experience craftsmanship, hospitality and stillness.",
  });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="luxury-container max-w-[900px] mx-auto">
          <ScrollFadeIn>
            <div className="text-center mb-16 md:mb-24">
              <p className="type-eyebrow mb-6">{HOUSE_STAY.eyebrow}</p>
              <h1 className="type-display mb-6">{HOUSE_STAY.title}</h1>
              <p className="luxury-body mx-auto max-w-[580px]">{HOUSE_STAY.intro}</p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.1}>
            <div className="text-center mb-16 md:mb-24 py-12 md:py-16 border-y border-border">
              <p className="font-serif font-light text-xl md:text-2xl text-foreground leading-relaxed max-w-[640px] mx-auto">
                {HOUSE_STAY.invitationHeadline}
              </p>
              <p className="type-body mt-4 max-w-[480px] mx-auto">
                {HOUSE_STAY.invitationBody}
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.15}>
            <div className="mb-12 md:mb-16">
              <p className="type-eyebrow mb-8 text-center">{HOUSE_STAY.experiencesEyebrow}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
                {EXPERIENCES.map((exp, i) => (
                  <div
                    key={exp.title}
                    className={`bg-background p-8 md:p-10 transition-colors duration-300 hover:bg-[hsl(var(--muted))] ${
                      i === EXPERIENCES.length - 1 && i % 2 === 0 ? "md:col-span-2" : ""
                    }`}
                  >
                    <h3 className="type-subtitle mb-3">{exp.title}</h3>
                    <p className="type-body">{exp.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.2}>
            <div className="pt-12 md:pt-16 border-t border-border">
              <div className="text-center mb-12">
                <p className="type-eyebrow mb-4">{HOUSE_STAY.formEyebrow}</p>
                <h2 className="type-title mb-4">{HOUSE_STAY.formTitle}</h2>
                <p className="luxury-body mx-auto max-w-[520px]">{HOUSE_STAY.formBody}</p>
              </div>
              <HouseVisitBookingForm />
            </div>
          </ScrollFadeIn>
        </div>
      </article>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default TheHouseStayPage;
