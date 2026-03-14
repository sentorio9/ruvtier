import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import WatermarkLogo from "@/components/WatermarkLogo";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import garmentImage from "@/assets/garment-single.jpg";
import materialImage from "@/assets/material-texture.jpg";

const sizes = ["XS", "S", "M", "L", "XL"];

const relatedProducts = [
  { name: "Cashmere Knit", price: "€1,200", slug: "cashmere-knit" },
  { name: "Silk Shirt", price: "€890", slug: "silk-shirt" },
  { name: "Merino Cardigan", price: "€1,450", slug: "merino-cardigan" },
];

const formatName = (slug: string) =>
  slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const productName = formatName(slug || "the-overcoat");

  return (
    <div className="relative">
      <WatermarkLogo />
      <Navigation />

      {/* Product hero */}
      <section className="pt-20 md:pt-28">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Images */}
            <ScrollFadeIn>
              <div className="flex flex-col gap-4">
                <div className="aspect-[3/4] bg-secondary overflow-hidden">
                  <img
                    src={garmentImage}
                    alt={productName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] bg-secondary overflow-hidden">
                  <img
                    src={materialImage}
                    alt={`${productName} detail`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </ScrollFadeIn>

            {/* Details */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ScrollFadeIn delay={0.15}>
                <h1 className="luxury-heading mb-3">{productName}</h1>
                <p className="text-muted-foreground text-lg tracking-wide mb-8">€2,850</p>

                <p className="luxury-body mb-8">
                  A garment of quiet permanence. Cut from the finest cloth, finished by hand,
                  and made to accompany its wearer across seasons and years.
                </p>

                {/* Size selector */}
                <div className="mb-8">
                  <p className="text-sm text-muted-foreground tracking-wide mb-3">Size</p>
                  <div className="flex gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 border text-sm tracking-wider transition-colors ${
                          selectedSize === size
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add to cart placeholder */}
                <button
                  disabled
                  className="w-full py-4 bg-foreground text-background text-sm tracking-[0.2em] uppercase opacity-40 cursor-not-allowed mb-4"
                >
                  Add to bag — coming soon
                </button>
                <p className="text-xs text-muted-foreground text-center tracking-wide">
                  Purchasing will be available soon
                </p>
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling */}
      <section className="luxury-section">
        <div className="luxury-container text-center">
          <ScrollFadeIn>
            <h2 className="luxury-heading mb-6">The making</h2>
          </ScrollFadeIn>
          <ScrollFadeIn delay={0.15}>
            <p className="luxury-body mx-auto text-center">
              Every garment begins as raw fibre — gathered, spun, and woven with an understanding
              of time. The cut is considered. The finish is patient. What remains is something
              that belongs to its wearer alone.
            </p>
          </ScrollFadeIn>
        </div>
      </section>

      {/* Related */}
      <section className="luxury-section border-t border-border">
        <div className="luxury-container">
          <ScrollFadeIn>
            <h2 className="luxury-heading text-center mb-12">You may also appreciate</h2>
          </ScrollFadeIn>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10">
            {relatedProducts.map((item, i) => (
              <ScrollFadeIn key={item.slug} delay={i * 0.08}>
                <Link to={`/product/${item.slug}`} className="group block">
                  <div className="relative overflow-hidden mb-4 bg-secondary aspect-[3/4]">
                    <img
                      src={garmentImage}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif font-light text-base tracking-wide text-foreground mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground tracking-wide">{item.price}</p>
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

export default ProductPage;
