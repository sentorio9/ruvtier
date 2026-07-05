/**
 * Refined coming-soon layout used for category routes whose pieces are
 * not yet composed. Keeps the route indexed and credible, offering two
 * clear next steps: register allocation interest, or book a private
 * appointment.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import AllocationRequestDrawer from "@/components/AllocationRequestDrawer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";

interface Props {
  title: string;
  intent?: string;
  body?: string;
  image?: string;
  breadcrumbLabel?: string;
}

const ComingSoonCategoryPage = ({
  title,
  intent = "This world is being composed.",
  body = "Available soon by private allocation. Register interest to be among the first informed when the first pieces are released.",
  image,
  breadcrumbLabel,
}: Props) => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  usePageMeta({
    title: `${title} — Forthcoming`,
    description: `${title} by RUVTIER — ${intent} ${body}`.slice(0, 250),
  });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-20 md:pb-28 min-h-[70vh]">
        <div className="luxury-container">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Boutique", to: "/boutique" },
              { label: breadcrumbLabel ?? title },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className={image ? "" : "md:col-span-2 max-w-[560px] mx-auto text-center"}>
              <ScrollFadeIn>
                <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                  Forthcoming
                </p>
                <h1 className="luxury-heading mb-6">{title}</h1>
                <p className="font-serif italic text-foreground/80 text-lg md:text-xl leading-relaxed mb-6">
                  {intent}
                </p>
                <p className="luxury-body mb-10">{body}</p>

                <div className={`flex flex-wrap gap-x-8 gap-y-4 ${image ? "" : "justify-center"}`}>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="luxury-button !text-[12px] tracking-[0.2em]"
                  >
                    Register Interest
                  </button>
                  <Link to="/appointments" className="luxury-button !text-[12px] tracking-[0.2em]">
                    Book Appointment
                  </Link>
                </div>
              </ScrollFadeIn>
            </div>

            {image && (
              <ScrollFadeIn delay={0.1}>
                <div className="aspect-[3/4] bg-secondary overflow-hidden">
                  <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </ScrollFadeIn>
            )}
          </div>
        </div>
      </section>

      <AllocationRequestDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={title}
      />
      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default ComingSoonCategoryPage;
