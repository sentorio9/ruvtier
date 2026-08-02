/**
 * By Allocation (`/by-allocation`).
 *
 * A dedicated destination for pieces released only through quiet
 * allocation. Reuses the editorial product-grid language from
 * The Collection while keeping the focus singular.
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

const ByAllocationPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const { data: products, isLoading } = useActiveProducts();
  usePageMeta({
    title: "By Allocation",
    description: "Pieces released only by quiet allocation. Request an introduction to the collection.",
  });
  usePriceTick();

  const allocated = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => (p as any).availability === "by_allocation");
  }, [products]);

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-28 md:pt-36 pb-8 md:pb-12">
        <div className="luxury-container text-center">
          <ScrollFadeIn>
            <div className="hero-glow inline-block">
              <h1 className="hero-title luxury-heading mb-4">By allocation</h1>
            </div>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto text-center max-w-2xl">
              A small selection of pieces released quietly, reserved for those who have been introduced to the house.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

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
          ) : allocated.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-12 md:gap-y-20">
              {allocated.map((product, i) => (
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
                      <h3 className="type-subtitle mb-1">{product.name}</h3>
                      <p className="type-body">
                        {formatPrice(product.price) ?? "Request Allocation"}
                      </p>
                    </div>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <p className="type-body text-muted-foreground">
                Allocation pieces are not yet available. Register your interest to be notified.
              </p>
            </div>
          )}
        </div>
      </section>

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default ByAllocationPage;
