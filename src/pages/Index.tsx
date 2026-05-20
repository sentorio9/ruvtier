import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { Editable } from "@/editor/Editable";
import { useSiteText, useSiteImage } from "@/editor/useSiteContent";

import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useActiveProducts, formatPrice, usePriceTick } from "@/hooks/useProducts";
import heroImage from "@/assets/hero-permanence.jpg";
import womenImage from "@/assets/collection-women.jpg";
import menImage from "@/assets/collection-men.jpg";
import knitwearImg from "@/assets/explore-knitwear.jpg";
import lifestyleImg from "@/assets/explore-lifestyle.jpg";
import appointmentImg from "@/assets/explore-appointment.png";
import materialMemoryScarf from "@/assets/material-memory-scarf.png";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "RUVTIER — A Whisper of Luxury", description: "RUVTIER is a luxury fashion house devoted to permanence, material origin, and the quiet art of garment composition. Discover the Spring/Summer 2026 collection." });
  usePriceTick();

  const heroHeadline = useSiteText("home_hero", "headline", "Permanence in garment form");
  const heroPreorderWomen = useSiteText("home_hero", "preorder_women", "Pre-Order for Women");
  const heroPreorderMen = useSiteText("home_hero", "preorder_men", "Pre-Order for Men");
  const materialMemoryHeadline = useSiteText("home_material_memory", "headline", "Material is Memory");
  const materialMemoryCta = useSiteText("home_material_memory", "cta_label", "Discover all material");
  const womenSeason = useSiteText("home_women_card", "season", "Spring / Summer 2026");
  const womenTitle = useSiteText("home_women_card", "title", "Women's Collection");
  const womenBlurb = useSiteText("home_women_card", "blurb", "Refined silhouettes shaped by material devotion and quiet permanence.");
  const womenCta = useSiteText("home_women_card", "cta_label", "Discover More");
  const menSeason = useSiteText("home_men_card", "season", "Spring / Summer 2026");
  const menTitle = useSiteText("home_men_card", "title", "Men's Collection");
  const menBlurb = useSiteText("home_men_card", "blurb", "Understated forms built from heritage craft and enduring composition.");
  const menCta = useSiteText("home_men_card", "cta_label", "Explore Collection");
  const inYourKeepingHeading = useSiteText("home_in_your_keeping", "headline", "In Your Keeping");
  const heroImageOverride = useSiteImage("site_image_home_hero");

  // Featured pre-order — pick the first featured product with preorder enabled, or any featured product
  const { data: featuredProducts } = useActiveProducts({ featured: true, limit: 5 });
  const featuredPreorder =
    featuredProducts?.find((p: any) => p.preorder_enabled) ?? featuredProducts?.[0] ?? null;
  const featuredImage =
    (featuredPreorder as any)?.hero_image_url ||
    (featuredPreorder as any)?.thumbnail_url ||
    null;
  const featuredHref = featuredPreorder
    ? ((featuredPreorder as any).preorder_enabled
        ? `/preorder/${featuredPreorder.slug}`
        : `/product/${featuredPreorder.slug}`)
    : null;

  return (
    <div className="relative">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 overflow-hidden">
          <Editable
            kind="site_image"
            contentKey="site_image_home_hero"
            label="Homepage hero image"
            as="div"
            className="absolute inset-0 overflow-hidden"
          >
            <img
              src={heroImageOverride || heroImage}
              alt="RUVTIER luxury garment editorial"
              className="absolute inset-0 w-full h-full object-cover object-[center_30%] md:object-center"
              fetchPriority="high"
              decoding="async"
            />
          </Editable>
          {/* Subtle veil clipped to the image frame so revealed edges stay background-white */}
          <div className="absolute inset-0 bg-foreground/15 pointer-events-none" />
        </div>
        {/* Soft luminous halo centred behind the editorial line for legibility on imagery */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(82vw,880px)] h-[min(40vh,320px)] rounded-[50%] blur-3xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(245,241,235,0.28) 0%, rgba(245,241,235,0.14) 42%, rgba(245,241,235,0) 75%)" }}
        />
        {/* Centred editorial line — nudged slightly lower for calmer composition */}
        <div className="relative z-10 text-center px-6 hero-glow translate-y-8 md:translate-y-12">
          <ScrollFadeIn>
            <Editable
              kind="text_block"
              contentKey="home_hero"
              field="headline"
              label="Homepage hero text"
              as="p"
              className="hero-title type-display mx-auto max-w-[var(--text-max)]"
            >
              {heroHeadline}
            </Editable>
          </ScrollFadeIn>
        </div>

        {/* Pre-order links anchored near the bottom */}
        <div className="absolute z-10 left-0 right-0 bottom-[clamp(48px,8vh,96px)] px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(72vw,640px)] h-[120px] rounded-[50%] blur-2xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(245,241,235,0.22) 0%, rgba(245,241,235,0.10) 45%, rgba(245,241,235,0) 78%)" }}
          />
          <ScrollFadeIn delay={0.25}>
            <div className="relative flex items-center justify-center gap-[clamp(40px,8vw,120px)]">
              <Link
                to="/boutique/women"
                className="group relative inline-block type-cta text-foreground transition-colors duration-500"
              >
                <Editable kind="text_block" contentKey="home_hero" field="preorder_women" label="Hero — Pre-Order Women" as="span">
                  {heroPreorderWomen}
                </Editable>
                <span
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-1 h-px bg-[#3A3A3A]/80 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                />
              </Link>
              <Link
                to="/boutique/men"
                className="group relative inline-block type-cta text-foreground transition-colors duration-500"
              >
                <Editable kind="text_block" contentKey="home_hero" field="preorder_men" label="Hero — Pre-Order Men" as="span">
                  {heroPreorderMen}
                </Editable>
                <span
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-1 h-px bg-[#3A3A3A]/80 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                />
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Featured Pre-Order — second scroll */}
      {featuredPreorder && (
        <section className="luxury-section bg-background">
          <div className="luxury-container py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Image */}
              <ScrollFadeIn>
                <Link to={featuredHref!} className="block group overflow-hidden">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary flex items-center justify-center transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:shadow-[0_24px_60px_-30px_rgba(58,58,58,0.18)]">
                    {featuredImage ? (
                      <img
                        src={featuredImage}
                        alt={featuredPreorder.name}
                        loading="lazy"
                        className="w-full h-full object-contain object-center transition-[transform,filter] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.015] group-hover:brightness-[1.02]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-serif italic">
                        {featuredPreorder.name}
                      </div>
                    )}
                  </div>
                </Link>
              </ScrollFadeIn>

              {/* Details */}
              <ScrollFadeIn delay={0.1}>
                <div className="flex flex-col items-start text-left max-w-[460px]">
                  {(featuredPreorder as any).preorder_enabled && (
                    <span className="type-eyebrow mb-5">
                      Private Access — Pre-Register
                    </span>
                  )}
                  <h2 className="type-display mb-5">
                    {featuredPreorder.name}
                  </h2>
                  {featuredPreorder.description && (
                    <p className="type-body mb-6">
                      {featuredPreorder.description}
                    </p>
                  )}
                  {(featuredPreorder as any).preorder_enabled ? (
                    <p className="type-eyebrow mb-8">
                      Available by allocation — not open purchase
                    </p>
                  ) : featuredPreorder.price != null ? (
                    <p className="type-subtitle mb-8">
                      {formatPrice(featuredPreorder.price)}
                    </p>
                  ) : null}
                  <Link to={featuredHref!} className="luxury-button">
                    {(featuredPreorder as any).preorder_enabled ? "Pre-Register" : "Discover the Piece"}
                  </Link>
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </section>
      )}

      {/* Split Collection — Women / Men */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 py-16 md:py-24 luxury-container">
        {/* Women */}
        <ScrollFadeIn>
          <Link to="/boutique/women" className="group block">
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:shadow-[0_30px_70px_-32px_rgba(0,0,0,0.35)]">
              <img
                src={womenImage}
                alt="Women's collection by RUVTIER"
                className="w-full h-full object-cover object-[center_25%] transition-[transform,filter] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.015] motion-safe:group-hover:brightness-[0.92]"
                loading="lazy"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-100 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
              />
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-6 pb-6 md:pb-10 text-[#F6F4F1]">
                <Editable kind="text_block" contentKey="home_women_card" field="season" label="Women — season label" as="span" className="type-eyebrow mb-3 md:mb-4 motion-safe:opacity-0 motion-safe:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                  {womenSeason}
                </Editable>
                <Editable kind="text_block" contentKey="home_women_card" field="title" label="Women — title" as="h2" className="type-display mb-4 md:mb-5 motion-safe:opacity-90 motion-safe:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                  {womenTitle}
                </Editable>
                <span className="inline-flex items-center gap-2 type-cta motion-safe:opacity-0 motion-safe:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[700ms] delay-100 ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                  <span className="relative inline-block pb-1">
                    <Editable kind="text_block" contentKey="home_women_card" field="cta_label" label="Women — CTA label" as="span">{womenCta}</Editable>
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 -bottom-px h-px bg-[#F6F4F1] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                    />
                  </span>
                  <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </ScrollFadeIn>

        {/* Men */}
        <ScrollFadeIn delay={0.1}>
          <Link to="/boutique/men" className="group block">
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary flex items-center justify-center transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:shadow-[0_30px_70px_-32px_rgba(0,0,0,0.35)]">
              <img
                src={menImage}
                alt="Men's collection by RUVTIER"
                className="w-full h-full object-contain object-center transition-[transform,filter] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.015] motion-safe:group-hover:brightness-[0.92]"
                loading="lazy"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-100 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
              />
              <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-6 pb-6 md:pb-10 text-[#F6F4F1]">
                <Editable kind="text_block" contentKey="home_men_card" field="season" label="Men — season label" as="span" className="type-eyebrow mb-3 md:mb-4 motion-safe:opacity-0 motion-safe:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                  {menSeason}
                </Editable>
                <Editable kind="text_block" contentKey="home_men_card" field="title" label="Men — title" as="h2" className="type-display mb-4 md:mb-5 motion-safe:opacity-90 motion-safe:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                  {menTitle}
                </Editable>
                <span className="inline-flex items-center gap-2 type-cta motion-safe:opacity-0 motion-safe:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[700ms] delay-100 ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                  <span className="relative inline-block pb-1">
                    <Editable kind="text_block" contentKey="home_men_card" field="cta_label" label="Men — CTA label" as="span">{menCta}</Editable>
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 -bottom-px h-px bg-[#F6F4F1] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                    />
                  </span>
                  <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </ScrollFadeIn>
      </section>

      {/* Material is Memory — Editorial section anchored by the silk scarf */}
      <section className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center pt-20 md:pt-32 pb-24 md:pb-36">
          <ScrollFadeIn>
            <div className="w-full max-w-[420px] md:max-w-[520px] mx-auto overflow-hidden">
              <img
                src={materialMemoryScarf}
                alt="A RUVTIER silk scarf draped over a wooden chair — the quiet permanence of material."
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.1}>
            <div className="mt-10 md:mt-14 flex flex-col items-center text-center">
              <Editable
                kind="text_block"
                contentKey="home_material_memory"
                field="headline"
                label="'Material is Memory' heading"
                as="h2"
                className="type-display mb-6 md:mb-8"
              >
                {materialMemoryHeadline}
              </Editable>
              <Editable
                kind="text_block"
                contentKey="home_material_memory"
                field="cta_label"
                label="'Material is Memory' button"
                as="span"
                className="inline-block transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:-translate-y-0.5"
              >
                <Link to="/materials" className="luxury-button type-cta">
                  {materialMemoryCta}
                </Link>
              </Editable>
            </div>
          </ScrollFadeIn>
        </div>
      </section>


      {/* In Your Keeping — Explore Section */}
      <section className="py-16 md:py-24">
        <div className="luxury-container">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_in_your_keeping" field="headline" label="'In Your Keeping' heading" as="h2" className="type-title text-center mb-10 md:mb-14">
              {inYourKeepingHeading}
            </Editable>
          </ScrollFadeIn>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8 lg:gap-10 items-start">
            {[
              { img: knitwearImg, label: "Knitwear", to: "/boutique/women", imgClass: "h-full w-[85%] translate-y-[5%]" },
              { img: lifestyleImg, label: "Life in RUVTIER", to: "/boutique/lifestyle", imgClass: "h-full w-full" },
              { img: appointmentImg, label: "By Appointment Only", to: "/contact", imgClass: "h-full w-full" },
            ].map((item, i) => (
              <ScrollFadeIn key={item.label} delay={i * 0.08}>
                <Link
                  to={item.to}
                  className="group block"
                >
                  <div className="relative flex w-full aspect-[4/5] items-center justify-center overflow-hidden bg-background px-[10%] py-[10%]">
                    <img
                      src={item.img}
                      alt={item.label}
                      loading="lazy"
                      className={`object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02] ${item.imgClass}`}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:opacity-100 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                    />
                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center text-center px-4 pb-5 md:pb-6 text-[#F6F4F1]">
                      <h3 className="type-subtitle motion-safe:opacity-90 motion-safe:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                        {item.label}
                      </h3>
                      <span className="mt-2 type-cta motion-safe:opacity-0 motion-safe:translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 transition-[opacity,transform] duration-[700ms] delay-100 ease-[cubic-bezier(0.22,0.61,0.36,1)]">
                        Explore
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Index;
