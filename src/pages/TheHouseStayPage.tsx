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

const EXPERIENCES = [
  {
    title: "Morning breakfast",
    body: "A slow start in the garden room. Coffee, fruit, and the first light of the day before the house opens.",
  },
  {
    title: "Private library",
    body: "A quiet room of reference: textile archives, pattern books, and the collected history of the house.",
  },
  {
    title: "Wine cellar",
    body: "A small, curated cellar beneath the atelier. Tastings are offered by arrangement.",
  },
  {
    title: "Meet artisans",
    body: "Spend time with the hands that cut, finish and inspect each piece. Questions are welcomed slowly.",
  },
  {
    title: "Garden & mountain walks",
    body: "The grounds surrounding the house are composed as carefully as the garments. Walks are guided or taken alone.",
  },
  {
    title: "Made-to-measure fittings",
    body: "A private fitting with the atelier team. Proportions are recorded and a piece is composed to the wearer.",
  },
  {
    title: "Styling consultation",
    body: "A one-to-one conversation on silhouette, material and wardrobe rhythm with a house stylist.",
  },
  {
    title: "Showroom viewing",
    body: "See the current collection in a private salon, away from display and distraction.",
  },
];

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
              <p className="type-eyebrow mb-6">Invitation-Led Visit</p>
              <h1 className="type-display mb-6">RUVTIER Stay</h1>
              <p className="luxury-body mx-auto max-w-[580px]">
                A place to experience the House beyond its garment. A place where craftsmanship, hospitality and stillness form.
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.1}>
            <div className="text-center mb-16 md:mb-24 py-12 md:py-16 border-y border-border">
              <p className="font-serif font-light text-xl md:text-2xl text-foreground leading-relaxed max-w-[640px] mx-auto">
                Book a trip to visit the House
              </p>
              <p className="type-body mt-4 max-w-[480px] mx-auto">
                Visits are arranged by invitation and confirmed in correspondence with a steward of the house.
              </p>
            </div>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.15}>
            <div className="mb-12 md:mb-16">
              <p className="type-eyebrow mb-8 text-center">Things you can do at your visit</p>
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
                <p className="type-eyebrow mb-4">Request an Invitation</p>
                <h2 className="type-title mb-4">Book a trip to Visit the House</h2>
                <p className="luxury-body mx-auto max-w-[520px]">
                  Share your preferred dates and the experiences that interest you. A steward will reply to arrange your visit.
                </p>
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
