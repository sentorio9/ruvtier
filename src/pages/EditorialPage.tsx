import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { useState } from "react";
import { Link } from "react-router-dom";

interface EditorialPageProps {
  title: string;
  subtitle?: string;
  body?: string;
  actionLabel?: string;
  actionTo?: string;
}

const EditorialPage = ({
  title,
  subtitle,
  body = "This chapter of the house is being composed.",
  actionLabel = "Explore",
  actionTo = "/",
}: EditorialPageProps) => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[70vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <h1 className="luxury-heading mb-6">{title}</h1>
          </ScrollFadeIn>
          {subtitle && (
            <ScrollFadeIn delay={0.1}>
              <p className="luxury-body mx-auto mb-4 italic text-center">{subtitle}</p>
            </ScrollFadeIn>
          )}
          <ScrollFadeIn delay={0.2}>
            <p className="luxury-body mx-auto mb-10 text-center">{body}</p>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Link to={actionTo} className="luxury-button">
              {actionLabel}
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default EditorialPage;
