/**
 * Material detail page (`/materials/:slug`).
 *
 * Refined per-material page organised into: intro · Feel · Use · Care ·
 * A note on origin · closing CTAs. Copy sources from
 * MATERIAL_DESCRIPTIONS in `src/content/brand.ts`, with safe generic
 * fall-backs when a material has not yet been written up.
 */
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MATERIAL_DESCRIPTIONS, MATERIAL_FALLBACK_DESCRIPTION } from "@/content/brand";

const formatName = (slug: string) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Safe generic guidance per material family. Deliberately avoids
// specific certifications, micron counts, or supplier names.
const MATERIAL_NOTES: Record<string, { feel: string; use: string; care: string; origin: string }> = {
  cashmere: {
    feel: "A weightless warmth that settles into the shape of the wearer over time. Softness deepens with wear.",
    use: "Suited to knitwear, shirting and outerwear where quiet warmth without bulk is essential.",
    care: "Rest between wear. Fold rather than hang. Wash by hand or dry-clean sparingly; reshape flat away from direct light.",
    origin: "Combed from the underfleece of highland goats bred in cold, dry climates. Selected for length, fineness and even colour.",
  },
  vicuna: {
    feel: "The finest natural fibre in the world — barely perceptible in weight, exceptional in warmth.",
    use: "Reserved for signature outerwear and knitwear composed in limited allocation.",
    care: "Handled minimally. Rest between wear. Restoration is offered privately by the house.",
    origin: "Sourced under strict international protection from wild herds in the high Andes. Shorn once, then returned to the mountain.",
  },
  "merino-wool": {
    feel: "Fine, elastic and quietly luminous. Holds structure without weight.",
    use: "Ideal for tailoring, knitwear and travel pieces that must recover their form through the day.",
    care: "Air between wear. Steam rather than iron. Dry-clean seasonally; store folded, away from direct light.",
    origin: "Bred for softness beyond measure. Selected for staple length and consistency of hand.",
  },
  silk: {
    feel: "A filament that catches light quietly. Cool to the touch, warm in movement.",
    use: "Chosen for blouses, linings and eveningwear where fluidity and light matter more than volume.",
    care: "Avoid prolonged exposure to light and fragrance. Rest between wear. Hand-wash or dry-clean; iron on the reverse at low heat.",
    origin: "Continuous filament, spun into cloth in mills chosen for the quiet consistency of their weave.",
  },
  "french-linen": {
    feel: "Cool, structured, and quietly luminous. Softens with every season.",
    use: "Composed for warm-weather tailoring, shirting and interior pieces.",
    care: "Wash cool and dry flat. Creasing is part of its character — press only where clarity is required.",
    origin: "Grown in the fields of Normandy, retted in dew rather than water, then spun with restraint.",
  },
  denim: {
    feel: "A weighted cloth that earns its memory through wear. Fades along the lines of a life.",
    use: "Composed as tailoring and outerwear where a piece is intended to age visibly with the wearer.",
    care: "Wash rarely and cold, inside out. Air between wear. Line-dry away from direct sun.",
    origin: "Selvedge denim woven on heritage shuttle looms in low, considered volumes.",
  },
  wool: {
    feel: "Structured, resilient, and quietly warm — a foundation cloth for tailoring.",
    use: "Composed for coats, suits and blazers where cut and weight must hold their line.",
    care: "Brush along the grain after wear. Rest on a shaped hanger. Steam rather than iron; dry-clean seasonally.",
    origin: "Milled from selected fleeces for staple length, resilience and evenness of hand.",
  },
  cotton: {
    feel: "Clean-handed and quietly cool. Softens with wash while holding its structure.",
    use: "Composed for shirting, day pieces and interior linens.",
    care: "Wash cool with a mild detergent. Iron on the reverse while slightly damp for a soft finish.",
    origin: "Selected for staple length and evenness; woven or knitted to specification.",
  },
  leather: {
    feel: "A living surface that develops a patina reflecting time, use and touch.",
    use: "Composed for accessories and outerwear intended to accompany the wearer over years.",
    care: "Avoid unnecessary friction. Store in a dust bag away from direct heat and light.",
    origin: "Tanned in restrained volumes by houses selected for the character and longevity of their leather.",
  },
};

const MaterialPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const key = slug || "";
  const name = formatName(key);
  const description = MATERIAL_DESCRIPTIONS[key] || MATERIAL_FALLBACK_DESCRIPTION;
  const notes = MATERIAL_NOTES[key];

  usePageMeta({
    title: name || "Material",
    description: `${name} at RUVTIER — ${description}`.slice(0, 250),
  });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="luxury-container max-w-[760px] mx-auto">
          <Breadcrumbs items={[
            { label: "Home", to: "/" },
            { label: "Materials", to: "/materials" },
            { label: name },
          ]} />

          <ScrollFadeIn>
            <div className="text-center mb-14 md:mb-20">
              <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-6">
                Material Library
              </p>
              <h1 className="luxury-heading mb-6">{name}</h1>
              <p className="font-serif italic text-foreground/80 text-lg leading-relaxed max-w-[520px] mx-auto">
                {description}
              </p>
            </div>
          </ScrollFadeIn>

          {notes ? (
            <div className="space-y-12 md:space-y-16">
              {[
                { label: "Feel", body: notes.feel },
                { label: "Use", body: notes.use },
                { label: "Care", body: notes.care },
                { label: "A note on origin", body: notes.origin },
              ].map((s, i) => (
                <ScrollFadeIn key={s.label} delay={i * 0.05}>
                  <section className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-10 border-t border-border pt-8">
                    <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground">
                      {s.label}
                    </p>
                    <p className="font-sans font-light text-[15px] leading-[1.95] text-foreground/85">
                      {s.body}
                    </p>
                  </section>
                </ScrollFadeIn>
              ))}
            </div>
          ) : (
            <ScrollFadeIn delay={0.1}>
              <p className="luxury-body text-center max-w-[520px] mx-auto">
                A fuller note on {name.toLowerCase()} is in quiet preparation. Please write to the house for private guidance.
              </p>
            </ScrollFadeIn>
          )}

          <ScrollFadeIn delay={0.15}>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-16 md:mt-24 pt-10 border-t border-border">
              <Link to="/materials" className="luxury-button !text-[12px] tracking-[0.2em]">
                All Materials
              </Link>
              <Link to="/collection" className="luxury-button !text-[12px] tracking-[0.2em]">
                Explore The Collection
              </Link>
              <Link to="/appointments" className="luxury-button !text-[12px] tracking-[0.2em]">
                Book Appointment
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default MaterialPage;
