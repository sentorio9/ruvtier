import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import { STILLNESS_QUOTE, STILLNESS_CTA } from "@/content/brand";

const Stillness = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "Stillness", description: "Every fibre carries origin, landscape, and time. We begin there, in silence." });
  const quote = useSiteText("stillness_quote", "body", STILLNESS_QUOTE);
  const cta = useSiteText("stillness_cta", "label", STILLNESS_CTA);

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[80vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <Editable
              kind="text_block"
              contentKey="stillness_quote"
              field="body"
              label="Stillness — quote"
              as="p"
              className="luxury-body mx-auto mb-10 text-center italic text-lg whitespace-pre-line"
            >
              {`"${quote}"`}
            </Editable>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.3}>
            <Editable kind="text_block" contentKey="stillness_cta" field="label" label="Stillness — button" as="span" className="inline-block">
              <Link to="/" className="luxury-button">{cta}</Link>
            </Editable>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Stillness;
