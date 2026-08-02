/**
 * The House — hub landing page.
 *
 * Four entry points into the world of RUVTIER:
 *   Philosophy, RUVTIER Stay, Journal, Appointments.
 *
 * A quiet, editorial gateway that keeps the manifesto voice
 * while inviting movement into the deeper rooms of the house.
 */
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";

const SECTIONS = [
  {
    key: "philosophy",
    eyebrow: "The House",
    title: "Philosophy",
    body: "Stillness as discipline. The conviction behind every garment, space, and silence the house keeps.",
    to: "/the-house/philosophy",
    cta: "Read the manifesto",
  },
  {
    key: "stay",
    eyebrow: "Experience",
    title: "RUVTIER Stay",
    body: "An invitation-led visit to the headquarters. Craftsmanship, hospitality and stillness in one place.",
    to: "/the-house/stay",
    cta: "Discover the stay",
  },
  {
    key: "journal",
    eyebrow: "Stories",
    title: "Journal",
    body: "Heritage notes, material journeys, and the slow chronicle of the house.",
    to: "/journal",
    cta: "Read the journal",
  },
  {
    key: "appointments",
    eyebrow: "By Appointment",
    title: "Appointments",
    body: "Reserve a private consultation, collection viewing, or a moment with a steward of the house.",
    to: "/appointments",
    cta: "Book an appointment",
  },
];

const TheHouseHub = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "The House",
    description: "Enter the house of RUVTIER — Philosophy, RUVTIER Stay, Journal, and private appointments.",
  });

  return (
    <div className="relative">
      <Navigation />

      <article className="pt-32 md:pt-40 pb-20 md:pb-28 min-h-[85vh]">
        <div className="luxury-container max-w-[1100px] mx-auto">
          <ScrollFadeIn>
            <div className="text-center mb-16 md:mb-24">
              <p className="type-eyebrow mb-6">Atelier Palermo</p>
              <h1 className="type-display mb-6">The House</h1>
              <p className="luxury-body mx-auto max-w-[560px]">
                A place to experience the house beyond its garment. A place where craftsmanship, hospitality and stillness form.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border border border-border">
            {SECTIONS.map((section, i) => (
              <ScrollFadeIn key={section.key} delay={i * 0.08}>
                <Link
                  to={section.to}
                  className="group block bg-background p-8 md:p-12 lg:p-16 transition-colors duration-500 hover:bg-[hsl(var(--muted))]"
                >
                  <p className="type-eyebrow mb-4">{section.eyebrow}</p>
                  <h2 className="type-title mb-4">{section.title}</h2>
                  <p className="type-body max-w-[360px] mb-8">{section.body}</p>
                  <span className="type-cta inline-block relative pb-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-foreground after:transition-all after:duration-500 group-hover:after:w-full">
                    {section.cta}
                  </span>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>

          <ScrollFadeIn delay={0.4}>
            <div className="text-center mt-16 md:mt-24 pt-12 border-t border-border">
              <p className="font-serif font-light text-lg md:text-xl text-foreground/90 italic tracking-wide">
                Ruvtier does not persuade. It remains.
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

export default TheHouseHub;
