/**
 * The Collection (`/collection`).
 *
 * Curated grid filtered by availability — the three quiet registers:
 * `In Store Only`, `Made-to-Measure Only`, `By Allocation Only`.
 *
 * Section order: Navigation · filter band with images · filtered
 * product grid · LuxuryFooter.
 *
 * Design-system dependencies: `.luxury-container`, `.type-display`,
 * `.type-cta`, `.luxury-button`. Product cards source live data from
 * Supabase via `useActiveProducts`.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { useActiveProducts, formatPrice, usePriceTick } from "@/hooks/useProducts";
import { usePageMeta } from "@/hooks/usePageMeta";
import garmentImage from "@/assets/garment-single.jpg";
import inStoreImage from "@/assets/collection-in-store.png";
import madeToMeasureImage from "@/assets/collection-made-to-measure.png";
import byAllocationImage from "@/assets/collection-by-allocation.png";

type Availability = "in_store" | "made_to_measure" | "by_allocation";

const FILTERS: { value: Availability; label: string; image: string; alt: string }[] = [
  { value: "in_store", label: "In Store Only", image: inStoreImage, alt: "A piece available exclusively in our boutiques." },
  { value: "made_to_measure", label: "Made-to-Measure Only", image: madeToMeasureImage, alt: "A garment composed to the wearer's own measure." },
  { value: "by_allocation", label: "By Allocation Only", image: byAllocationImage, alt: "A piece released only by quiet allocation." },
];

const CollectionPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [active, setActive] = useState<Availability>("in_store");
  const { data: products, isLoading } = useActiveProducts();
  usePageMeta({
    title: "The Collection",
    description: "Curated garments composed with care, intention, and the finest materials.",
  });
  usePriceTick();

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter(
      (p) => ((p as any).availability ?? "in_store") === active
    );
  }, [products, active]);

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-28 md:pt-36 pb-8 md:pb-12">
        <div className="luxury-container text-center">
          <ScrollFadeIn>
            <div className="hero-glow inline-block">
              <h1 className="hero-title luxury-heading mb-4">The collection</h1>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto text-center">
              Each piece is composed with patience and intention.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="pb-8 md:pb-14">
        <div className="luxury-container">
          <ScrollFadeIn>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-16">
              {FILTERS.map((f) => {
                const isActive = active === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setActive(f.value)}
                    aria-pressed={isActive}
                    className="group relative inline-flex flex-col items-center pb-2 type-subtitle"
                  >
                    <span
                      className={`transition-opacity duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                        isActive ? "opacity-100" : "opacity-55 group-hover:opacity-100"
                      }`}
                    >
                      {f.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none mt-1.5 block h-px w-full bg-foreground/70 origin-center transform transition-all duration-[700ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                        isActive
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0 group-hover:opacity-50 group-hover:scale-x-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Active section visual — the hero image bound to the chosen filter */}
      <section className="pb-12 md:pb-20">
        <div className="luxury-container">
          {(() => {
            const current = FILTERS.find((f) => f.value === active)!;
            return (
              <ScrollFadeIn key={`hero-${active}`}>
                <div className="mx-auto w-full max-w-[420px] md:max-w-[520px] aspect-[3/4] overflow-hidden bg-secondary">
                  <img
                    src={current.image}
                    alt={current.alt}
                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                    loading="eager"
                  />
                </div>
              </ScrollFadeIn>
            );
          })()}
        </div>
      </section>

      {/* Pieces tagged for this section, if any */}
      {(isLoading || filtered.length > 0) && (
        <section className="luxury-section" style={{ paddingTop: 0 }}>
          <div className="luxury-container">
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-16">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-secondary mb-4" />
                    <div className="h-4 bg-secondary w-3/4 mb-2" />
                    <div className="h-3 bg-secondary w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div
                key={`grid-${active}`}
                className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-12 md:gap-y-20"
              >
                {filtered.map((product, i) => (
                  <ScrollFadeIn key={product.id} delay={i * 0.06}>
                    <Link to={`/product/${product.slug}`} className="group relative block pb-20 md:pb-24 focus:outline-none">
                      <div className="relative overflow-hidden bg-secondary aspect-[3/4] transition-shadow duration-[850ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:shadow-[0_24px_60px_-38px_rgba(0,0,0,0.35)] group-focus-visible:shadow-[0_24px_60px_-38px_rgba(0,0,0,0.35)]">
                        <img
                          src={product.thumbnail_url || garmentImage}
                          alt={product.name}
                          className="w-full h-full object-cover transition-[transform,filter] duration-[1000ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.025] group-hover:brightness-[0.98] group-focus-visible:scale-[1.025] group-focus-visible:brightness-[0.98]"
                          loading="lazy"
                        />
                      </div>
                      <div className="absolute left-1/2 top-full z-10 flex w-[88%] max-w-[280px] -translate-x-1/2 flex-col items-center bg-background px-4 py-3 text-center text-foreground shadow-none will-change-transform transition-[transform,box-shadow] duration-[850ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-safe:group-hover:-translate-y-[62%] motion-safe:group-focus-visible:-translate-y-[62%] motion-safe:group-hover:shadow-[0_18px_45px_-34px_rgba(0,0,0,0.45)] motion-safe:group-focus-visible:shadow-[0_18px_45px_-34px_rgba(0,0,0,0.45)]">
                        <h3 className="type-subtitle mb-1">
                          {product.name}
                        </h3>
                        <p className="type-body">
                          {formatPrice(product.price) ?? "Request Allocation"}
                        </p>
                      </div>
                    </Link>
                  </ScrollFadeIn>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default CollectionPage;
