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
import materialMemoryScarf from "@/assets/material-memory-scarf.png";

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
        <Editable kind="site_image" contentKey="site_image_home_hero" label="Homepage hero image" as="div" className="absolute inset-0">
          <img
            src={heroImageOverride || heroImage}
            alt="RUVTIER luxury garment editorial"
            className="absolute inset-0 w-full h-full object-cover object-[center_40%] md:object-[center_35%]"
            fetchPriority="high"
            decoding="async"
          />
        </Editable>
        <div className="absolute inset-0 bg-background/40 pointer-events-none" />
        <div className="relative z-10 text-center px-6 -mt-8 md:-mt-12">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_hero" field="headline" label="Homepage hero text" as="p" className="font-serif font-light text-[clamp(20px,2.2vw,28px)] leading-[1.7] tracking-[0.08em] text-foreground mx-auto max-w-[var(--text-max)]">
              {heroHeadline}
            </Editable>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.3}>
            <Editable kind="text_block" contentKey="home_hero" field="cta_label" label="Hero button label" as="span" className="inline-block mt-10">
              <Link to="/collection" className="luxury-button">
                {heroCta}
              </Link>
            </Editable>
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
              {/* Refined overlay — deeper at the base so type can glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
              {/* Soft luminous halo behind the title */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[18%] w-[70%] h-[38%] rounded-[50%] blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-700"
                style={{ background: "radial-gradient(ellipse at center, rgba(246,244,241,0.45) 0%, rgba(246,244,241,0.15) 45%, rgba(246,244,241,0) 75%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-14 md:pb-20 pt-24 flex flex-col items-center text-center">
                <Editable kind="text_block" contentKey="home_women_card" field="season" label="Women — season label" as="span" className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#F6F4F1]/70 mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
                  {womenSeason}
                </Editable>
                <Editable kind="text_block" contentKey="home_women_card" field="title" label="Women — title" as="h2" className="font-serif font-light text-[clamp(26px,2.6vw,38px)] tracking-[0.09em] text-[#F6F4F1] mb-3 leading-[1.2] [text-shadow:0_2px_18px_rgba(0,0,0,0.55),0_0_28px_rgba(246,244,241,0.18)]">
                  {womenTitle}
                </Editable>
                <Editable kind="text_block" contentKey="home_women_card" field="blurb" label="Women — blurb" as="p" className="font-sans text-[11px] tracking-[0.04em] text-[#F6F4F1]/80 mb-5 max-w-[260px] leading-[1.6] [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                  {womenBlurb}
                </Editable>
                <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-[#F6F4F1]/85 group-hover:text-[#F6F4F1] transition-colors duration-500 border-b border-[#F6F4F1]/30 group-hover:border-[#F6F4F1]/70 pb-0.5">
                  <Editable kind="text_block" contentKey="home_women_card" field="cta_label" label="Women — CTA label" as="span">{womenCta}</Editable>
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
              {/* Refined overlay — deeper at the base so type can glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
              {/* Soft luminous halo behind the title */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[18%] w-[70%] h-[38%] rounded-[50%] blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-700"
                style={{ background: "radial-gradient(ellipse at center, rgba(246,244,241,0.45) 0%, rgba(246,244,241,0.15) 45%, rgba(246,244,241,0) 75%)" }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-14 md:pb-20 pt-24 flex flex-col items-center text-center">
                <Editable kind="text_block" contentKey="home_men_card" field="season" label="Men — season label" as="span" className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#F6F4F1]/70 mb-3 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
                  {menSeason}
                </Editable>
                <Editable kind="text_block" contentKey="home_men_card" field="title" label="Men — title" as="h2" className="font-serif font-light text-[clamp(26px,2.6vw,38px)] tracking-[0.09em] text-[#F6F4F1] mb-3 leading-[1.2] [text-shadow:0_2px_18px_rgba(0,0,0,0.55),0_0_28px_rgba(246,244,241,0.18)]">
                  {menTitle}
                </Editable>
                <Editable kind="text_block" contentKey="home_men_card" field="blurb" label="Men — blurb" as="p" className="font-sans text-[11px] tracking-[0.04em] text-[#F6F4F1]/80 mb-5 max-w-[260px] leading-[1.6] [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
                  {menBlurb}
                </Editable>
                <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-[#F6F4F1]/85 group-hover:text-[#F6F4F1] transition-colors duration-500 border-b border-[#F6F4F1]/30 group-hover:border-[#F6F4F1]/70 pb-0.5">
                  <Editable kind="text_block" contentKey="home_men_card" field="cta_label" label="Men — CTA label" as="span">{menCta}</Editable>
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
            <div className="relative w-full max-w-[420px] md:max-w-[520px] mx-auto mb-10 md:mb-14 overflow-hidden">
              <img
                src={materialMemoryScarf}
                alt="A RUVTIER silk scarf draped over a wooden chair — the quiet permanence of material."
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.12}>
            <Editable kind="text_block" contentKey="home_material_memory" field="headline" label="'Material is Memory' heading" as="h2" className="luxury-heading mb-6">{materialMemoryHeadline}</Editable>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.2}>
            <Editable kind="text_block" contentKey="home_material_memory" field="cta_label" label="'Material is Memory' button" as="span" className="inline-block">
              <Link to="/materials" className="luxury-button">{materialMemoryCta}</Link>
            </Editable>
          </ScrollFadeIn>
        </div>
      </section>


      {/* In Your Keeping — Explore Section */}
      <section className="py-16 md:py-24">
        <div className="luxury-container">
          <ScrollFadeIn>
            <Editable kind="text_block" contentKey="home_in_your_keeping" field="headline" label="'In Your Keeping' heading" as="h2" className="font-serif font-light text-[clamp(18px,1.6vw,22px)] tracking-[0.15em] text-foreground text-center mb-10 md:mb-14">
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
