import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";

interface EditorialPageProps {
  title: string;
  subtitle?: string;
  body?: string;
  actionLabel?: string;
  actionTo?: string;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const EditorialPage = ({
  title,
  subtitle,
  body = "This chapter of the house is being composed.",
  actionLabel = "Explore",
  actionTo = "/",
}: EditorialPageProps) => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title,
    description: subtitle && subtitle.length >= 50
      ? subtitle
      : `${title} — a chapter of the RUVTIER house, composed in the quiet art of garment permanence, rare materials, and enduring craft. ${subtitle || body}`.slice(0, 300),
    ogType: "article",
  });
  const key = `editorial_${slugify(title)}`;
  const titleVal = useSiteText(key, "title", title);
  const subtitleVal = useSiteText(key, "subtitle", subtitle || "");
  const bodyVal = useSiteText(key, "body", body);
  const actionVal = useSiteText(key, "action_label", actionLabel);

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[40vh] flex items-center justify-center pt-32 pb-12">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey={key} field="title" label={`${title} — title`} as="h1" className="luxury-heading mb-6">
              {titleVal}
            </Editable>
          </ScrollFadeIn>
          {subtitleVal && (
            <ScrollFadeIn delay={0.1}>
              <Editable kind="text_block" contentKey={key} field="subtitle" label={`${title} — subtitle`} as="p" className="luxury-body mx-auto mb-4 italic text-center">
                {subtitleVal}
              </Editable>
            </ScrollFadeIn>
          )}
          <ScrollFadeIn delay={0.2}>
            <Editable kind="text_block" contentKey={key} field="body" label={`${title} — body`} as="p" className="luxury-body mx-auto mb-10 text-center">
              {bodyVal}
            </Editable>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Editable kind="text_block" contentKey={key} field="action_label" label={`${title} — button`} as="span" className="inline-block">
              <Link to={actionTo} className="luxury-button">
                {actionVal}
              </Link>
            </Editable>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default EditorialPage;
