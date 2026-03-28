import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { useActiveProducts, formatPrice } from "@/hooks/useProducts";
import { usePageMeta } from "@/hooks/usePageMeta";
import garmentImage from "@/assets/garment-single.jpg";

const CollectionPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const { data: products, isLoading } = useActiveProducts();
  usePageMeta({ title: "The Collection", description: "Curated garments composed with care, intention, and the finest materials." });

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-28 md:pt-36 pb-8 md:pb-12">
        <div className="luxury-container text-center">
          <ScrollFadeIn>
            <h1 className="luxury-heading mb-4">The collection</h1>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto text-center">
              Each piece is composed with patience and intention.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      <section className="luxury-section" style={{ paddingTop: 0 }}>
        <div className="luxury-container">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-16">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-secondary mb-4" />
                  <div className="h-4 bg-secondary w-3/4 mb-2" />
                  <div className="h-3 bg-secondary w-1/4" />
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-16">
              {products.map((product, i) => (
                <ScrollFadeIn key={product.id} delay={i * 0.08}>
                  <Link to={`/product/${product.slug}`} className="group block">
                    <div className="relative overflow-hidden mb-4 bg-secondary aspect-[3/4]">
                      <img
                        src={product.thumbnail_url || garmentImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-serif font-light text-base md:text-lg tracking-wide text-foreground mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground tracking-wide">
                      {formatPrice(product.price)}
                    </p>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="luxury-body text-muted-foreground">
                The collection is being composed. Please return soon.
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

export default CollectionPage;
