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

  // Featured pre-order
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
    <div className="relative md:h-[100svh] md:overflow-y-scroll md:snap-y md:snap-mandatory motion-safe:md:scroll-smooth">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[100svh] md:snap-start flex items-center justify-center overflow-hidden bg-background">
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
          <div className="absolute inset-0 bg-foreground/15 pointer-events-none" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(82vw,880px)] h-[min(40vh,320px)] rounded-[50%] blur-3xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(245,241,235,0.28) 0%, rgba(245,241,235,0.14) 42%, rgba(245,241,235,0) 75%)" }}
        />
        <div className="relative z-10 flex flex-col items-center text-center px-6 hero-glow translate-y-4 md:translate-y-8 max-w-4xl">
          <ScrollFadeIn>
            <Link
              to="/collection"
              aria-label="Discover the Spring/Summer 2026 collection"
              className="group flex flex-col items-center transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] hover:scale-[1.01]"
            >
              <Editable
                kind="text_block"
                contentKey="home_hero"
                field="headline"
                label="Homepage hero text"
                as="h1"
                className="hero-title type-display text-[#F6F4F1] text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.15] tracking-[0.08em] mb-6"
              >
                {heroHeadline}
              </Editable>
              <div
                aria-hidden
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] -mt-1"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F6F4F1" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                </svg>
              </div>
            </Link>
          </ScrollFadeIn>

          <ScrollFadeIn delay={0.25}>
            <div className="relative mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-16">
              <Link
                to="/boutique/women"
                className="group flex flex-col items-center type-cta text-[#F6F4F1] transition-colors duration-500"
              >
                <Editable kind="text_block" contentKey="home_hero" field="preorder_women" label="Hero — Pre-Order Women" as="span">
                  {heroPreorderWomen}
                </Editable>
                <span
                  aria-hidden
                  className="block w-full h-px bg-[#F6F4F1] mt-1 origin-left scale-x-100 opacity-60 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                />
              </Link>
              <Link
                to="/boutique/men"
                className="group flex flex-col items-center type-cta text-[#F6F4F1] transition-colors duration-500"
              >
                <Editable kind="text_block" contentKey="home_hero" field="preorder_men" label="Hero — Pre-Order Men" as="span">
                  {heroPreorderMen}
                </Editable>
                <span
                  aria-hidden
                  className="block w-full h-px bg-[#F6F4F1] mt-1 origin-left scale-x-100 opacity-60 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                />
              </Link>
            </div>
          </ScrollFadeIn>
        </div>

        <div aria-hidden className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px h-12 bg-[#F6F4F1] opacity-25" />
      </section>

      {/* Featured Pre-Order */}
      {featuredPreorder && (
        <section className="luxury-section bg-background min-h-[100svh] md:snap-start flex items-center">
          <div className="luxury-container w-full py-[clamp(48px,8vh,96px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <ScrollFadeIn>
                <Link to={featuredHref!} className="block group overflow-hidden mx-auto w-full max-w-[min(100%,60vh)]">
                  <div className="relative w-full aspect-[3/4] max-h-[78svh] overflow-hidden bg-secondary flex items-center justify-center transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:shadow-[0_24px_60px_-30px_rgba(58,58,58,0.18)]">
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
      <section className="md:h-[100svh] md:snap-start flex flex-col justify-center bg-background">
        <div className="luxury-container w-full grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 md:h-full md:max-h-[calc(100svh-96px)] py-[clamp(48px,7vh,96px)]">
          {[
            {
              to: "/boutique/women",
              primary: womenImage,
              secondary: heroImage,
              alt: "Women's collection by RUVTIER",
              season: womenSeason,
              title: womenTitle,
              cta: womenCta,
              contentKey: "home_women_card",
              objectPos: "object-[center_25%]",
              delay: 0,
            },
            {
              to: "/boutique/men",
              primary: menImage,
              secondary: lifestyleImg,
              alt: "Men's collection by RUVTIER",
              season: menSeason,
              title: menTitle,
              cta: menCta,
              contentKey: "home_men_card",
              objectPos: "object-center",
              delay: 0.1,
            },
          ].map((card) => (
            <ScrollFadeIn key={card.to} delay={card.delay}>
              <Link to={card.to} className="group relative flex flex-col h-full overflow-hidden">
                {/* Image frame */}
                <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-secondary transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:shadow-[0_30px_70px_-32px_rgba(0,0,0,0.35)]">
                  <img
                    src={card.primary}
                    alt={card.alt}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover ${card.objectPos} transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-safe:group-hover:opacity-0`}
                  />
                  <img
                    src={card.secondary}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-0 scale-[1.02] motion-safe:group-hover:opacity-100 motion-safe:group-hover:scale-100 transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  />
                </div>
                {/* Caption panel — always visible, lifts on hover */}
                <div className="relative z-10 shrink-0 bg-background flex flex-col items-center text-center px-6 pt-5 md:pt-6 pb-2 h-[110px] md:h-[124px] transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-safe:group-hover:-translate-y-[56px] md:motion-safe:group-hover:-translate-y-[64px]">
                  <Editable kind="text_block" contentKey={card.contentKey} field="season" label={`${card.alt} — season label`} as="span" className="type-eyebrow mb-2 md:mb-3">
                    {card.season}
                  </Editable>
                  <Editable kind="text_block" contentKey={card.contentKey} field="title" label={`${card.alt} — title`} as="h2" className="type-title mb-2 md:mb-3">
                    {card.title}
                  </Editable>
                  <span className="inline-flex items-center gap-2 type-cta">
                    <span className="relative inline-block pb-1">
                      <Editable kind="text_block" contentKey={card.contentKey} field="cta_label" label={`${card.alt} — CTA label`} as="span">{card.cta}</Editable>
                      <span
                        aria-hidden
                        className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                      />
                    </span>
                    <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                  </span>
                </div>
              </Link>
            </ScrollFadeIn>
          ))}
        </div>
      </section>

      {/* Material is Memory */}
      <section className="luxury-section min-h-[100svh] md:snap-start flex items-center">
        <div className="luxury-container w-full flex flex-col items-center text-center py-[clamp(48px,8vh,96px)]">
          <ScrollFadeIn>
            <div className="w-full max-w-[320px] md:max-w-[400px] mx-auto aspect-[3/4] max-h-[48svh]">
              <img
                src={materialMemoryScarf}
                alt="A RUVTIER silk scarf draped over a wooden chair — the quiet permanence of material."
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.1}>
            <div className="mt-8 md:mt-12 flex flex-col items-center text-center">
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

      {/* In Your Keeping */}
      <section className="min-h-[100svh] md:snap-start flex flex-col justify-center py-[clamp(48px,8vh,96px)]">
        <div className="luxury-container w-full">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_in_your_keeping" field="headline" label="'In Your Keeping' heading" as="h2" className="type-title text-center mb-10 md:mb-14">
              {inYourKeepingHeading}
            </Editable>
          </ScrollFadeIn>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-10 items-start">
            {[
              { img: knitwearImg, label: "Knitwear", to: "/boutique/women", imgClass: "h-full w-[85%] translate-y-[5%]" },
              { img: lifestyleImg, label: "Life in RUVTIER", to: "/boutique/lifestyle", imgClass: "h-full w-full" },
              { img: appointmentImg, label: "By Appointment Only", to: "/contact", imgClass: "h-full w-full" },
            ].map((item, i) => (
              <ScrollFadeIn key={item.label} delay={i * 0.08}>
                <Link to={item.to} className="group flex flex-col">
                  <div className="relative flex w-full aspect-[4/5] max-h-[55svh] items-center justify-center overflow-hidden bg-background px-[10%] py-[10%]">
                    <img
                      src={item.img}
                      alt={item.label}
                      loading="lazy"
                      className={`object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02] ${item.imgClass}`}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 via-black/10 to-transparent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                    />
                  </div>
                  <div className="flex flex-col items-center text-center px-4 pt-4 md:pt-5 text-foreground">
                    <h3 className="type-subtitle">
                      {item.label}
                    </h3>
                    <span className="mt-2 type-cta relative inline-block pb-1">
                      Explore
                      <span
                        aria-hidden
                        className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                      />
                    </span>
                  </div>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="md:snap-start">
        <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      </div>
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Index;
