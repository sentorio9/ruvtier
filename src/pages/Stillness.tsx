import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Link } from "react-router-dom";

const Stillness = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "Stillness", description: "Every fibre carries origin, landscape, and time. We begin there, in silence." });

  return (
    <div className="relative">
      <Navigation />

      <section className="min-h-[80vh] flex items-center justify-center pt-32 pb-20">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <p className="luxury-body mx-auto mb-10 text-center italic text-lg">
              "Every fibre carries origin, landscape, and time.
              <br />
              We begin there, in silence."
            </p>
          </ScrollFadeIn>

          {/* Video removed per editorial direction */}

          <ScrollFadeIn delay={0.3}>
            <Link to="/" className="luxury-button">
              Return
            </Link>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Stillness;
