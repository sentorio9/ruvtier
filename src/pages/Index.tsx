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
import heroImage from "@/assets/hero-editorial.jpg";
import womenImage from "@/assets/collection-women.jpg";
import menImage from "@/assets/collection-men.jpg";
import knitwearImg from "@/assets/explore-knitwear.jpg";
import lifestyleImg from "@/assets/explore-lifestyle.jpg";
import appointmentImg from "@/assets/explore-appointment.png";

const Index = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  usePageMeta({ title: "RUVTIER", description: "A luxury fashion house devoted to permanence, material origin, and the quiet art of garment composition." });
  usePriceTick();
  const heroHeadline = useSiteText("home_hero", "headline", "Permanence in garment form");
  const heroCta = useSiteText("home_hero", "cta_label", "Explore the Collection");
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
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="RUVTIER luxury garment editorial"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%] md:object-[center_35%]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="relative z-10 text-center px-6 -mt-8 md:-mt-12">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_hero" field="headline" label="Homepage hero text" as="p" className="font-serif font-light text-[clamp(20px,2.2vw,28px)] leading-[1.7] tracking-[0.08em] text-foreground mx-auto max-w-[var(--text-max)]">
              {heroHeadline}
            </Editable>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Link to="/collection" className="luxury-button mt-10 inline-block">
              Explore the Collection
            </Link>
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
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary">
                    {featuredImage ? (
                      <img
                        src={featuredImage}
                        alt={featuredPreorder.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
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
                    <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-5">
                      Private Access — Pre-Register
                    </span>
                  )}
                  <h2 className="font-serif font-light text-[clamp(28px,3.2vw,44px)] leading-[1.15] tracking-[0.04em] text-foreground mb-5">
                    {featuredPreorder.name}
                  </h2>
                  {featuredPreorder.description && (
                    <p className="font-sans font-light text-[clamp(14px,1.05vw,16px)] leading-[1.9] text-muted-foreground mb-6">
                      {featuredPreorder.description}
                    </p>
                  )}
                  {(featuredPreorder as any).preorder_enabled ? (
                    <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-8">
                      Available by allocation — not open purchase
                    </p>
                  ) : featuredPreorder.price != null ? (
                    <p className="font-serif font-light text-[clamp(16px,1.3vw,20px)] text-foreground mb-8">
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
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 py-16 md:py-24 luxury-container">
        {/* Women */}
        <ScrollFadeIn>
          <Link to="/boutique/women" className="group flex flex-col items-center text-center">
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <img
                src={womenImage}
                alt="Women's collection by RUVTIER"
                className="w-full h-full object-cover object-[center_25%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
              {/* Refined overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-20 flex flex-col items-center text-center">
                <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#12131C]/50 mb-2">
                  Spring / Summer 2026
                </span>
                <h2 className="font-serif font-light text-[clamp(22px,2.2vw,32px)] tracking-[0.08em] text-[#12131C] mb-2 leading-[1.2]">
                  Women's Collection
                </h2>
                <p className="font-sans text-[11px] tracking-[0.04em] text-[#12131C]/60 mb-4 max-w-[260px] leading-[1.6]">
                  Refined silhouettes shaped by material devotion and quiet permanence.
                </p>
                <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-[#12131C]/70 group-hover:text-[#12131C] transition-colors duration-500 border-b border-[#12131C]/20 group-hover:border-[#12131C]/50 pb-0.5">
                  Discover More
                  <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </ScrollFadeIn>

        {/* Men */}
        <ScrollFadeIn delay={0.1}>
          <Link to="/boutique/men" className="group flex flex-col items-center text-center">
            <div className="relative w-full aspect-[3/4] overflow-hidden">
              <img
                src={menImage}
                alt="Men's collection by RUVTIER"
                className="w-full h-full object-cover object-[center_25%] transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
              {/* Refined overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-20 flex flex-col items-center text-center">
                <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#12131C]/50 mb-2">
                  Spring / Summer 2026
                </span>
                <h2 className="font-serif font-light text-[clamp(22px,2.2vw,32px)] tracking-[0.08em] text-[#12131C] mb-2 leading-[1.2]">
                  Men's Collection
                </h2>
                <p className="font-sans text-[11px] tracking-[0.04em] text-[#12131C]/60 mb-4 max-w-[260px] leading-[1.6]">
                  Understated forms built from heritage craft and enduring composition.
                </p>
                <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-[#12131C]/70 group-hover:text-[#12131C] transition-colors duration-500 border-b border-[#12131C]/20 group-hover:border-[#12131C]/50 pb-0.5">
                  Explore Collection
                  <svg className="w-3 h-3 transition-transform duration-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" /></svg>
                </span>
              </div>
            </div>
          </Link>
        </ScrollFadeIn>
      </section>

      {/* Material is Memory — Static Section (video disabled) */}
      <section className="luxury-section">
        <div className="luxury-container flex flex-col items-center text-center py-28 md:py-40">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_material_memory" field="headline" label="'Material is Memory' heading" as="h2" className="luxury-heading mb-6">{materialMemoryHeadline}</Editable>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <Link to="/materials" className="luxury-button">
              Discover all material
            </Link>
          </ScrollFadeIn>
        </div>
      </section>


      {/* In Your Keeping — Explore Section */}
      <section className="py-16 md:py-24">
        <div className="luxury-container">
          <ScrollFadeIn>
            <h2 className="font-serif font-light text-[clamp(18px,1.6vw,22px)] tracking-[0.15em] text-foreground text-center mb-10 md:mb-14">
              In Your Keeping
            </h2>
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
                  className="group grid h-full grid-rows-[auto_auto_auto] content-start justify-items-center gap-0 text-center"
                >
                  <div className="flex w-full aspect-[4/5] items-center justify-center overflow-hidden bg-background px-[10%] py-[10%]">
                    <img
                      src={item.img}
                      alt={item.label}
                      loading="lazy"
                      className={`object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.02] ${item.imgClass}`}
                    />
                  </div>
                  <h3 className="mt-6 min-h-[2.75rem] self-start font-serif text-[clamp(15px,1.4vw,18px)] font-light tracking-[0.12em] text-foreground flex items-start justify-center text-center leading-[1.35] md:min-h-[3rem]">
                    {item.label}
                  </h3>
                  <span className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors duration-500 group-hover:text-foreground">
                    Explore
                  </span>
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
