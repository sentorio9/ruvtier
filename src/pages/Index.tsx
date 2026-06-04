/**
 * Homepage — the opening cadence of the house.
 *
 * Reads as a slow editorial sequence: hero · featured pre-order ·
 * split Women/Men collection · Material is Memory · In Your Keeping ·
 * footer. Sections snap on desktop (md+) for a film-strip feel.
 *
 * Section order:
 *   1. Hero — `.hero-glow` + `.type-display` over `heroImage`.
 *   2. Featured Pre-Order — first product where `preorder_enabled`.
 *   3. Split Collection — Women & Men cards with image cross-fade.
 *   4. Material is Memory — silk-scarf still, CTA to /materials.
 *   5. In Your Keeping — three quiet tiles.
 *   6. LuxuryFooter.
 *
 * Design-system dependencies: `.luxury-container`, `.luxury-section`,
 * `.type-display` / `.type-title` / `.type-eyebrow` / `.type-cta`,
 * `.luxury-button`, `.hero-glow`, single easing curve
 * `cubic-bezier(0.22,0.61,0.36,1)`. Copy fallbacks mirror
 * `src/content/brand.ts`.
 */
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
import womenPrimary from "@/assets/collection-women-primary.jpg";
import womenHover from "@/assets/collection-women-hover.jpg";
import menPrimary from "@/assets/collection-men-primary.jpg";
import menHover from "@/assets/collection-men-hover.jpg";
import knitwearImg from "@/assets/explore-knitwear.jpg";
import lifestyleImg from "@/assets/explore-lifestyle.jpg";
import appointmentImg from "@/assets/explore-appointment.png";
import materialMemoryScarf from "@/assets/material-memory-scarf.png";
import materialMemoryMacro from "@/assets/material-memory-macro.jpg";
import {
  HOME_HERO_HEADLINE,
  HOME_HERO_EYEBROW,
  HOME_HERO_CTA,
  HOME_HERO_UTILITY,
  HOME_HERO_PREORDER_WOMEN,
  HOME_HERO_PREORDER_MEN,
  HOME_MATERIAL_MEMORY_HEADLINE,
  HOME_MATERIAL_MEMORY_CTA,
  HOME_MATERIAL_MEMORY_EYEBROW,
  HOME_MATERIAL_MEMORY_TAG,
  HOME_MATERIAL_MEMORY_BLURB,
  HOME_WOMEN_CARD,
  HOME_MEN_CARD,
  HOME_IN_YOUR_KEEPING_HEADLINE,
} from "@/content/brand";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "RUVTIER — A Whisper of Luxury", description: "RUVTIER is a luxury fashion house devoted to permanence, material origin, and the quiet art of garment composition. Discover the Spring/Summer 2026 collection." });
  usePriceTick();

  const heroHeadline = useSiteText("home_hero", "headline", HOME_HERO_HEADLINE);
  const heroEyebrow = useSiteText("home_hero", "eyebrow", HOME_HERO_EYEBROW);
  const heroCta = useSiteText("home_hero", "cta_label", HOME_HERO_CTA);
  const heroUtility = useSiteText("home_hero", "utility_caption", HOME_HERO_UTILITY);
  const heroPreorderWomen = useSiteText("home_hero", "preorder_women", HOME_HERO_PREORDER_WOMEN);
  const heroPreorderMen = useSiteText("home_hero", "preorder_men", HOME_HERO_PREORDER_MEN);
  const materialMemoryHeadline = useSiteText("home_material_memory", "headline", HOME_MATERIAL_MEMORY_HEADLINE);
  const materialMemoryCta = useSiteText("home_material_memory", "cta_label", HOME_MATERIAL_MEMORY_CTA);
  const materialMemoryEyebrow = useSiteText("home_material_memory", "eyebrow", HOME_MATERIAL_MEMORY_EYEBROW);
  const materialMemoryTag = useSiteText("home_material_memory", "tag", HOME_MATERIAL_MEMORY_TAG);
  const materialMemoryBlurb = useSiteText("home_material_memory", "blurb", HOME_MATERIAL_MEMORY_BLURB);
  const womenSeason = useSiteText("home_women_card", "season", HOME_WOMEN_CARD.season);
  const womenTitle = useSiteText("home_women_card", "title", HOME_WOMEN_CARD.title);
  const womenBlurb = useSiteText("home_women_card", "blurb", HOME_WOMEN_CARD.blurb);
  const womenCta = useSiteText("home_women_card", "cta_label", HOME_WOMEN_CARD.cta);
  const menSeason = useSiteText("home_men_card", "season", HOME_MEN_CARD.season);
  const menTitle = useSiteText("home_men_card", "title", HOME_MEN_CARD.title);
  const menBlurb = useSiteText("home_men_card", "blurb", HOME_MEN_CARD.blurb);
  const menCta = useSiteText("home_men_card", "cta_label", HOME_MEN_CARD.cta);
  const inYourKeepingHeading = useSiteText("home_in_your_keeping", "headline", HOME_IN_YOUR_KEEPING_HEADLINE);
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
    <div className="relative md:h-[100svh] md:overflow-y-scroll md:snap-y md:snap-proximity motion-safe:md:scroll-smooth">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-[100svh] md:snap-start overflow-hidden bg-background">
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

        <div className="relative z-10 luxury-container h-full min-h-[100svh] flex flex-col justify-end pb-[clamp(64px,12vh,140px)] pt-[clamp(96px,18vh,180px)]">
          <div className="max-w-[640px]">
            <ScrollFadeIn>
              <Editable
                kind="text_block"
                contentKey="home_hero"
                field="eyebrow"
                label="Hero — eyebrow"
                as="p"
                className="type-eyebrow text-[#F6F4F1]/80 text-xs md:text-sm tracking-luxury-widest mb-6 md:mb-8"
              >
                {heroEyebrow}
              </Editable>
              <Editable
                kind="text_block"
                contentKey="home_hero"
                field="headline"
                label="Homepage hero text"
                as="h1"
                className="hero-title type-display text-[#F6F4F1] text-5xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-[0.02em]"
              >
                {heroHeadline}
              </Editable>
            </ScrollFadeIn>

            <ScrollFadeIn delay={0.2}>
              <Link
                to="/collection"
                className="group inline-flex flex-col items-start type-cta text-[#F6F4F1] mt-8 md:mt-10 transition-colors duration-500"
              >
                <Editable kind="text_block" contentKey="home_hero" field="cta_label" label="Hero — primary CTA" as="span">
                  {heroCta}
                </Editable>
                <span
                  aria-hidden
                  className="block w-full h-px bg-[#F6F4F1] mt-1 origin-left scale-x-100 opacity-70 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                />
              </Link>
            </ScrollFadeIn>
          </div>
        </div>

        <div className="pointer-events-none absolute z-10 bottom-[clamp(64px,12vh,140px)] right-[clamp(24px,5vw,64px)] hidden sm:block">
          <ScrollFadeIn delay={0.35}>
            <Editable
              kind="text_block"
              contentKey="home_hero"
              field="utility_caption"
              label="Hero — utility caption"
              as="span"
              className="type-eyebrow text-[#F6F4F1]/70 text-xs tracking-luxury-wide"
            >
              {heroUtility}
            </Editable>
          </ScrollFadeIn>
        </div>
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
      <section className="md:min-h-[100svh] md:snap-start flex flex-col justify-center bg-background">
        <div className="luxury-container w-full py-[clamp(32px,4vh,64px)]">
          <div className="grid grid-cols-1 gap-10 md:gap-8 md:max-w-[72%] md:mx-auto md:[grid-template-columns:1fr_1fr] md:[transition:grid-template-columns_500ms_cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:md:[&:has(.panel-women:hover)]:[grid-template-columns:51fr_49fr] [@media(hover:hover)]:md:[&:has(.panel-men:hover)]:[grid-template-columns:49fr_51fr]">
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
                  {/* Image frame — locked 3:4 desktop, 4:5 mobile */}
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
                  {/* Caption — fixed baselines across panels */}
                  <div className="relative z-10 shrink-0 bg-background flex flex-col items-center text-center px-6 pt-6 md:pt-7 pb-2 min-h-[150px] md:min-h-[160px]">
                    <Editable kind="text_block" contentKey={card.contentKey} field="season" label={`${card.alt} — season label`} as="span" className="type-eyebrow tracking-luxury-wide mb-3">
                      {card.season}
                    </Editable>
                    <Editable kind="text_block" contentKey={card.contentKey} field="title" label={`${card.alt} — title`} as="h2" className="type-title mb-4">
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
