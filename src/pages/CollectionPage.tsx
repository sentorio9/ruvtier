import { useState } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import garmentImage from "@/assets/garment-single.jpg";

const placeholderProducts = [
  { id: "1", name: "The Overcoat", price: "€2,850", slug: "the-overcoat" },
  { id: "2", name: "Cashmere Knit", price: "€1,200", slug: "cashmere-knit" },
  { id: "3", name: "Silk Shirt", price: "€890", slug: "silk-shirt" },
  { id: "4", name: "Linen Trouser", price: "€720", slug: "linen-trouser" },
  { id: "5", name: "Merino Cardigan", price: "€1,450", slug: "merino-cardigan" },
  { id: "6", name: "Vicuña Scarf", price: "€3,600", slug: "vicuna-scarf" },
];

const CollectionPage = () => {
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="relative">
      <WatermarkLogo />
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10 md:gap-y-16">
            {placeholderProducts.map((product, i) => (
              <ScrollFadeIn key={product.id} delay={i * 0.08}>
                <Link to={`/product/${product.slug}`} className="group block">
                  <div className="relative overflow-hidden mb-4 bg-secondary aspect-[3/4]">
                    <img
                      src={garmentImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif font-light text-base md:text-lg tracking-wide text-foreground mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground tracking-wide">
                    {product.price}
                  </p>
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

export default CollectionPage;
