/**
 * Homepage — continuous editorial sequence.
 *
 * Section order:
 *   1. Hero (full-bleed, 88vh)
 *   2. Manifesto (warm-1 band, contained)
 *   3. Split Collection — Women / Men (ivory, contained)
 *   4. The Edit (warm-2 band, contained, 4-up featured products)
 *   5. Material is Memory (full-bleed centerpiece)
 *   6. The Making (full-bleed dark editorial story)
 *   7. The Icons (ivory, contained, 3-up signature products)
 *   8. At Your Service (charcoal full-bleed band)
 *   9. Allocation Note (warm-1 band)
 *  10. In Your Keeping (ivory, contained)
 *  11. LuxuryFooter
 *
 * Scroll-snap removed — native scrolling only. Sections are content-
 * driven; vertical rhythm comes from .section-pad-* and alternating
 * band tones (ivory · warm-1 · warm-2 · charcoal).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { Editable } from "@/editor/Editable";
import { useSiteText, useSiteImage } from "@/editor/useSiteContent";

import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import MaterialCenterpiece from "@/components/home/MaterialCenterpiece";
import TheMaking from "@/components/home/TheMaking";
import TheIcons from "@/components/home/TheIcons";
import AtYourService from "@/components/home/AtYourService";
import AllocationNote from "@/components/home/AllocationNote";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useActiveProducts, formatPrice, usePriceTick } from "@/hooks/useProducts";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-main-replacement.png.asset.json";
import womenPrimary from "@/assets/collection-women-primary.jpg";
import womenHover from "@/assets/collection-women-hover.jpg";
import menPrimary from "@/assets/collection-men-primary.jpg";
import menHover from "@/assets/collection-men-hover.jpg";
import knitwearImg from "@/assets/sketch-knitwear.png.asset.json";
import lifestyleImg from "@/assets/sketch-lifestyle.png.asset.json";
import appointmentImg from "@/assets/sketch-appointment.png.asset.json";
import {
  HOME_HERO_HEADLINE,
  HOME_HERO_EYEBROW,
  HOME_HERO_CTA,
  HOME_HERO_UTILITY,
  HOME_MANIFESTO_LINE,
  HOME_MANIFESTO_EYEBROW,
  HOME_EDIT_EYEBROW,
  HOME_EDIT_HEADLINE,
  HOME_EDIT_VIEW_ALL,
  HOME_WOMEN_CARD,
  HOME_MEN_CARD,
  HOME_IN_YOUR_KEEPING_HEADLINE,
} from "@/content/brand";

// Whole-figure price formatter used inside The Edit and The Icons.
// formatPrice already returns a clean, rounded, whole-figure luxury
// price, or null when the piece has no firm price yet. In that case
// we surface the quiet allocation CTA.
const formatPriceWhole = (price: number | null | undefined): string =>
  formatPrice(price) ?? "Request Allocation";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({
    title: "RUVTIER — A Whisper of Luxury",
    description:
      "RUVTIER is a luxury fashion house devoted to permanence, material origin, and the quiet art of garment composition. Discover the Spring/Summer 2026 collection.",
  });
  usePriceTick();

  const heroHeadline = useSiteText("home_hero", "headline", HOME_HERO_HEADLINE);
  const heroEyebrow = useSiteText("home_hero", "eyebrow", HOME_HERO_EYEBROW);
  const heroCta = useSiteText("home_hero", "cta_label", HOME_HERO_CTA);
  const heroUtility = useSiteText("home_hero", "utility_caption", HOME_HERO_UTILITY);
  const womenSeason = useSiteText("home_women_card", "season", HOME_WOMEN_CARD.season);
  const womenTitle = useSiteText("home_women_card", "title", HOME_WOMEN_CARD.title);
  const womenCta = useSiteText("home_women_card", "cta_label", HOME_WOMEN_CARD.cta);
  const menSeason = useSiteText("home_men_card", "season", HOME_MEN_CARD.season);
  const menTitle = useSiteText("home_men_card", "title", HOME_MEN_CARD.title);
  const menCta = useSiteText("home_men_card", "cta_label", HOME_MEN_CARD.cta);
  const inYourKeepingHeading = useSiteText("home_in_your_keeping", "headline", HOME_IN_YOUR_KEEPING_HEADLINE);
  const manifestoLine = useSiteText("home_manifesto", "line", HOME_MANIFESTO_LINE);
  const manifestoEyebrow = useSiteText("home_manifesto", "eyebrow", HOME_MANIFESTO_EYEBROW);
  const editEyebrow = useSiteText("home_edit", "eyebrow", HOME_EDIT_EYEBROW);
  const editHeadline = useSiteText("home_edit", "headline", HOME_EDIT_HEADLINE);
  const editViewAll = useSiteText("home_edit", "view_all", HOME_EDIT_VIEW_ALL);
  const heroImageOverride = useSiteImage("site_image_home_hero");

  // Product sets: pull a single batch of featured products, then split
  // between The Edit (first 4) and The Icons (next 3, no overlap).
  const { data: featuredProducts, error: featuredError, isLoading: featuredLoading } = useActiveProducts({ featured: true, limit: 12 });
  const allFeatured = featuredProducts ?? [];
  const editProducts = allFeatured.slice(0, 4);
  const iconProducts = allFeatured.slice(4, 7);

  useEffect(() => {
    console.info("[Index] featured products", {
      isSupabaseConfigured,
      isLoading: featuredLoading,
      count: featuredProducts?.length ?? 0,
      error: featuredError,
    });
  }, [featuredProducts, featuredError, featuredLoading]);


  return (
    <div className="relative bg-background">
      <Navigation />

      {/* 1. Hero — contained, image-then-caption, never full-bleed */}
      <section className="bg-background pt-[60px] md:pt-[112px] pb-16 md:pb-24">
        <div className="luxury-container w-full">
          <ScrollFadeIn>
            <Editable
              kind="site_image"
              contentKey="site_image_home_hero"
              label="Homepage hero image"
              as="div"
              className="relative w-full max-h-[60vh] aspect-[16/9] overflow-hidden bg-secondary"
            >
              <img
                src={heroImageOverride || heroImage.url}
                alt="RUVTIER luxury garment editorial"
                className="absolute inset-0 w-full h-full object-cover object-center motion-kenburns"
                fetchPriority="high"
                decoding="async"
              />
            </Editable>
          </ScrollFadeIn>

          <div className="flex flex-col items-center text-center pt-7 md:pt-9">
            <ScrollFadeIn delay={0.05}>
              <Editable
                kind="text_block"
                contentKey="home_hero"
                field="eyebrow"
                label="Hero — eyebrow"
                as="p"
                className="type-eyebrow tracking-luxury-widest text-muted-foreground mb-3 md:mb-4"
              >
                {heroEyebrow}
              </Editable>
            </ScrollFadeIn>
            <ScrollFadeIn delay={0.15}>
              <Editable
                kind="text_block"
                contentKey="home_hero"
                field="headline"
                label="Homepage hero text"
                as="h1"
                className="font-serif font-light text-foreground text-[clamp(28px,4.4vw,56px)] leading-[1.1] tracking-[0.02em] max-w-[20ch] mx-auto"
              >
                {heroHeadline}
              </Editable>
            </ScrollFadeIn>
            <ScrollFadeIn delay={0.25}>
              <Link
                to="/collection"
                className="group inline-flex items-center type-cta tracking-luxury-wide text-foreground mt-6 md:mt-8"
              >
                <span className="relative inline-block pb-1 uppercase">
                  <Editable kind="text_block" contentKey="home_hero" field="cta_label" label="Hero — primary CTA" as="span">
                    {heroCta}
                  </Editable>
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  />
                </span>
              </Link>
            </ScrollFadeIn>
          </div>
        </div>
      </section>


      {/* 2. Manifesto — warm-1 interstitial */}
      <section className="bg-warm-1 hairline-top hairline-bottom section-pad-sm">
        <div className="luxury-container flex flex-col items-center text-center">
          <ScrollFadeIn>
            <Editable
              kind="text_block"
              contentKey="home_manifesto"
              field="line"
              label="Manifesto — line"
              as="p"
              className="font-serif italic font-light text-foreground text-[clamp(20px,2.4vw,28px)] leading-[1.5] max-w-[560px] mx-auto"
            >
              {manifestoLine}
            </Editable>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.1}>
            <Editable
              kind="text_block"
              contentKey="home_manifesto"
              field="eyebrow"
              label="Manifesto — eyebrow"
              as="p"
              className="type-eyebrow tracking-luxury-wide text-foreground/55 mt-5 md:mt-6 uppercase"
            >
              {manifestoEyebrow}
            </Editable>
          </ScrollFadeIn>
        </div>
      </section>

      {/* 3. Split Collection — Women / Men */}
      <section className="bg-background section-pad-md">
        <div className="luxury-container w-full">
          <div className="grid grid-cols-2 gap-4 md:gap-8 md:[grid-template-columns:1fr_1fr] md:[transition:grid-template-columns_500ms_cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:md:[&:has(.panel-women:hover)]:[grid-template-columns:51fr_49fr] [@media(hover:hover)]:md:[&:has(.panel-men:hover)]:[grid-template-columns:49fr_51fr]">
            {[
              {
                to: "/boutique/women",
                primary: womenPrimary,
                secondary: womenHover,
                alt: "Women's collection by RUVTIER",
                season: womenSeason,
                title: womenTitle,
                cta: womenCta,
                contentKey: "home_women_card",
                panelClass: "panel-women",
                delay: 0,
              },
              {
                to: "/boutique/men",
                primary: menPrimary,
                secondary: menHover,
                alt: "Men's collection by RUVTIER",
                season: menSeason,
                title: menTitle,
                cta: menCta,
                contentKey: "home_men_card",
                panelClass: "panel-men",
                delay: 0.1,
              },
            ].map((card) => (
              <ScrollFadeIn key={card.to} delay={card.delay}>
                <Link to={card.to} className={`group ${card.panelClass} relative flex flex-col overflow-hidden`}>
                  <div className="relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden bg-secondary transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:shadow-[0_30px_70px_-32px_rgba(0,0,0,0.35)]">
                    <img
                      src={card.primary}
                      alt={card.alt}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="absolute inset-0 w-full h-full object-cover object-center transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:motion-safe:group-hover:opacity-0 [@media(hover:hover)]:motion-safe:group-hover:scale-[1.01]"
                    />
                    <img
                      src={card.secondary}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:motion-safe:group-hover:opacity-100 [@media(hover:hover)]:motion-safe:group-hover:scale-[1.01]"
                    />
                  </div>
                  <div className="relative z-10 shrink-0 bg-background flex flex-col items-center text-center px-3 md:px-6 pt-5 md:pt-8 pb-3 md:pb-4 min-h-[120px] md:min-h-[168px]">
                    <Editable kind="text_block" contentKey={card.contentKey} field="season" label={`${card.alt} — season label`} as="span" className="type-eyebrow tracking-luxury-wide mb-3 md:mb-4">
                      {card.season}
                    </Editable>
                    <Editable kind="text_block" contentKey={card.contentKey} field="title" label={`${card.alt} — title`} as="h2" className="type-title mb-4 md:mb-5">
                      {card.title}
                    </Editable>
                    <span className="type-cta tracking-luxury-wide">
                      <span className="relative inline-block pb-1">
                        <Editable kind="text_block" contentKey={card.contentKey} field="cta_label" label={`${card.alt} — CTA label`} as="span">{card.cta}</Editable>
                        <span
                          aria-hidden
                          className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 [@media(hover:hover)]:group-hover:scale-x-100 transition-transform duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                        />
                      </span>
                    </span>
                  </div>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. The Edit — warm-2 band, 4-up featured products */}
      <section className="bg-warm-2 hairline-top hairline-bottom section-pad-md">
        <div className="luxury-container w-full">
          <ScrollFadeIn>
            <div className="flex items-end justify-between gap-6 pb-5 md:pb-7 border-b border-border mb-8 md:mb-12">
              <div className="flex flex-col items-start">
                <Editable kind="text_block" contentKey="home_edit" field="eyebrow" label="The Edit — eyebrow" as="span" className="type-eyebrow tracking-luxury-wide text-foreground/55 uppercase mb-2 md:mb-3">
                  {editEyebrow}
                </Editable>
                <Editable kind="text_block" contentKey="home_edit" field="headline" label="The Edit — headline" as="h2" className="type-display">
                  {editHeadline}
                </Editable>
              </div>
              <Link to="/collection" className="group hidden md:inline-flex items-center type-cta tracking-luxury-wide shrink-0">
                <span className="relative inline-block pb-1">
                  <Editable kind="text_block" contentKey="home_edit" field="view_all" label="The Edit — view all" as="span" className="uppercase">
                    {editViewAll}
                  </Editable>
                  <span aria-hidden className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]" />
                </span>
                <span aria-hidden className="ml-2">→</span>
              </Link>
            </div>
          </ScrollFadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[clamp(12px,2vw,24px)] gap-y-10 md:gap-y-12">
            {editProducts.length > 0
              ? editProducts.map((p: any, i: number) => {
                const img = p.hero_image_url || p.thumbnail_url || null;
                const isPreorder = !!p.preorder_enabled;
                const href = isPreorder ? `/preorder/${p.slug}` : `/product/${p.slug}`;
                const cta = isPreorder ? "Reserve" : "Discover";
                const priceLabel = p.price != null ? formatPriceWhole(p.price) : null;
                return (
                  <ScrollFadeIn key={p.id} delay={i * 0.06}>
                    <Link to={href} className="group flex flex-col">
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:shadow-[0_24px_60px_-30px_rgba(58,58,58,0.22)]">
                        {img ? (
                          <img
                            src={img}
                            alt={p.name}
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif italic text-sm">
                            {p.name}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start pt-4 md:pt-5 text-left">
                        <h3 className="font-serif font-light text-foreground text-[14px] md:text-[16px] leading-snug">
                          {p.name}
                        </h3>
                        <p className="type-eyebrow tracking-luxury-wide text-foreground/55 mt-2 md:mt-2.5 uppercase">
                          {priceLabel ? <>{priceLabel} <span className="mx-1 opacity-60">·</span> {cta}</> : cta}
                        </p>
                      </div>
                    </Link>
                  </ScrollFadeIn>
                );
              })
              : Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary" aria-hidden />
                  <div className="pt-4 md:pt-5">
                    <p className="type-eyebrow tracking-luxury-wide text-foreground/60 uppercase">
                      {featuredError ? "Selection temporarily unavailable" : featuredLoading ? "Loading" : "Selection coming soon"}
                    </p>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </section>



      {/* 5. Material is Memory — full-bleed centerpiece */}
      <MaterialCenterpiece />

      {/* 6. The Making — full-bleed editorial story */}
      <TheMaking />

      {/* 7. The Icons — second product set */}
      <TheIcons products={iconProducts} formatPriceWhole={formatPriceWhole} />

      {/* 8. At Your Service — charcoal band */}
      <AtYourService />

      {/* 9. Allocation Note — warm-1 band */}
      <AllocationNote onJoinClick={() => setSubscribeOpen(true)} />

      {/* 10. In Your Keeping */}
      <section className="bg-background section-pad-md border-t border-border">
        <div className="luxury-container w-full">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_in_your_keeping" field="headline" label="'In Your Keeping' heading" as="h2" className="type-display text-center mb-10 md:mb-14">
              {inYourKeepingHeading}
            </Editable>
          </ScrollFadeIn>
          <div className="grid grid-cols-3 gap-3 md:gap-8 lg:gap-10 items-start">
            {[
              { img: knitwearImg.url, label: "Knitwear", to: "/boutique/women" },
              { img: lifestyleImg.url, label: "Life in RUVTIER", to: "/boutique/lifestyle" },
              { img: appointmentImg.url, label: "By Appointment Only", to: "/contact" },
            ].map((item, i) => (
              <ScrollFadeIn key={item.label} delay={i * 0.08}>
                <Link to={item.to} className="group flex flex-col">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-background border border-border/60">
                    <img
                      src={item.img}
                      alt={item.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-contain object-center p-[3%] transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="flex flex-col items-center text-center px-2 md:px-4 pt-4 md:pt-6 text-foreground">
                    <h3 className="type-title leading-luxury-card text-[15px] md:text-[inherit] min-h-[3em] md:min-h-0 flex items-start justify-center">
                      {item.label}
                    </h3>
                    <span className="mt-3 md:mt-4 type-cta tracking-luxury-wide relative inline-block pb-1">
                      <span className="relative inline-block pb-1">
                        EXPLORE
                        <span aria-hidden className="absolute left-0 right-0 -bottom-px h-px bg-current" />
                      </span>
                    </span>
                  </div>
                </Link>
              </ScrollFadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default Index;
