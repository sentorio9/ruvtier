import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";

interface Entry {
  eyebrow: string;
  title: string;
  excerpt: string;
  to?: string;
  status: "published" | "forthcoming";
}

const ENTRIES: Entry[] = [
  {
    eyebrow: "Nº 01 — Notes",
    title: "Stillness and Craft",
    excerpt: "On the discipline of restraint. Why the house releases only what is resolved.",
    to: "/stillness",
    status: "published",
  },
  {
    eyebrow: "Nº 02 — Notes",
    title: "The Meaning of Allocation",
    excerpt: "Allocation is not scarcity. It is the quiet order by which a piece finds the wearer it was composed for.",
    status: "forthcoming",
  },
  {
    eyebrow: "Nº 03 — House",
    title: "The House of RUVTIER",
    excerpt: "Founder, philosophy, and the Palermo atelier. A quiet statement of intent.",
    to: "/the-house",
    status: "published",
  },
  {
    eyebrow: "Nº 04 — Material",
    title: "Notes on Material",
    excerpt: "Cashmere, silk, wool, linen — each fibre carries origin, landscape, and time.",
    to: "/materials",
    status: "published",
  },
  {
    eyebrow: "Nº 05 — Client",
    title: "Private Appointment Culture",
    excerpt: "What to expect from a first appointment with the house. How correspondence begins and continues.",
    status: "forthcoming",
  },
];

const JournalPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "Journal",
    description: "The RUVTIER Journal — quiet writings on craft, allocation, material and the culture of private appointments.",
    ogType: "article",
  });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-20 md:pb-28">
        <div className="luxury-container max-w-[900px] mx-auto">
          <ScrollFadeIn>
            <div className="text-center mb-16 md:mb-24">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                Editorial
              </p>
              <h1 className="luxury-heading mb-6">Journal</h1>
              <p className="luxury-body mx-auto max-w-[520px]">
                Quiet writings from the house — on craft, allocation, material, and the culture of private appointments.
              </p>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {ENTRIES.map((e, i) => {
              const inner = (
                <>
                  <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-4">
                    {e.eyebrow}
                    {e.status === "forthcoming" && (
                      <span className="ml-3 text-foreground/50">· Forthcoming</span>
                    )}
                  </p>
                  <h2 className="font-serif font-light text-[clamp(22px,2vw,28px)] tracking-[0.02em] text-foreground mb-4 leading-tight">
                    {e.title}
                  </h2>
                  <p className="font-sans font-light text-[14px] leading-[1.85] text-foreground/75">
                    {e.excerpt}
                  </p>
                  {e.status === "published" && e.to && (
                    <p className="mt-6 text-[11px] tracking-[0.22em] uppercase text-foreground/70 group-hover:text-foreground transition-colors">
                      Read
                    </p>
                  )}
                </>
              );
              return (
                <ScrollFadeIn key={e.title} delay={i * 0.05}>
                  {e.to && e.status === "published" ? (
                    <Link to={e.to} className="group block border-t border-border pt-8 hover:opacity-90 transition-opacity">
                      {inner}
                    </Link>
                  ) : (
                    <article className="border-t border-border pt-8 opacity-70">{inner}</article>
                  )}
                </ScrollFadeIn>
              );
            })}
          </div>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default JournalPage;
