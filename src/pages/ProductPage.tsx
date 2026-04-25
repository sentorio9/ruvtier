import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import { useProductBySlug, useActiveProducts, formatPrice, usePriceTick } from "@/hooks/useProducts";
import { usePageMeta } from "@/hooks/usePageMeta";
import garmentImage from "@/assets/garment-single.jpg";
import materialImage from "@/assets/material-texture.jpg";

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: relatedProducts } = useActiveProducts({ limit: 3 });

  // Redirect to preorder page if preorder is enabled
  useEffect(() => {
    if (product && (product as any).preorder_enabled) {
      navigate(`/preorder/${slug}`, { replace: true });
    }
  }, [product, slug, navigate]);

  usePageMeta({
    title: product?.name ?? "Product",
    description: product?.description ?? "A RUVTIER garment composed with intention.",
  });

  // Parse size_options from product JSON
  const sizes: string[] = product?.size_options
    ? (Array.isArray(product.size_options) ? product.size_options as string[] : [])
    : ["XS", "S", "M", "L", "XL"];

  const colors: string[] = product?.color_options
    ? (Array.isArray(product.color_options) ? product.color_options as string[] : [])
    : [];

  const gallery: string[] = product?.media_gallery && Array.isArray(product.media_gallery)
    ? (product.media_gallery as string[])
    : [];

  // Compose hero image stack: media_gallery if present, otherwise hero/thumbnail
  const galleryImages = gallery.length > 0
    ? gallery
    : [product?.hero_image_url, product?.thumbnail_url].filter(Boolean) as string[];

  if (isLoading) {
    return (
      <div className="relative">
        <Navigation />
        <section className="pt-20 md:pt-28">
          <div className="luxury-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="animate-pulse">
                <div className="aspect-[3/4] bg-secondary" />
              </div>
              <div className="animate-pulse space-y-4 pt-8">
                <div className="h-8 bg-secondary w-3/4" />
                <div className="h-4 bg-secondary w-1/4" />
                <div className="h-20 bg-secondary w-full mt-6" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="relative">
        <Navigation />
        <section className="pt-28 md:pt-36 pb-20">
          <div className="luxury-container text-center">
            <h1 className="luxury-heading mb-4">Product not found</h1>
            <p className="luxury-body text-muted-foreground mb-8">
              This piece may no longer be available.
            </p>
            <Link to="/collection" className="luxury-button">
              Return to Collection
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const filtered = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 3) || [];

  return (
    <div className="relative">
      <Navigation />

      {/* Product hero */}
      <section className="pt-20 md:pt-28">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Images */}
            <ScrollFadeIn>
              <div className="flex flex-col gap-4">
                {galleryImages.length > 0 ? (
                  galleryImages.map((src, i) => (
                    <div key={`${src}-${i}`} className="aspect-[3/4] bg-secondary overflow-hidden">
                      <img
                        src={src}
                        alt={i === 0 ? product.name : `${product.name} — view ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  ))
                ) : (
                  <div className="aspect-[3/4] bg-secondary overflow-hidden">
                    <img src={garmentImage} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </ScrollFadeIn>

            {/* Details */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ScrollFadeIn delay={0.15}>
                <h1 className="luxury-heading mb-3">{product.name}</h1>
                <p className="text-muted-foreground text-lg tracking-wide mb-8">
                  {formatPrice(product.price)}
                  {product.compare_at_price && product.compare_at_price > (product.price || 0) && (
                    <span className="ml-3 line-through text-muted-foreground/50 text-base">
                      {formatPrice(product.compare_at_price)}
                    </span>
                  )}
                </p>

                {product.description && (
                  <p className="luxury-body mb-8">{product.description}</p>
                )}

                {/* Colour selector */}
                {colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground tracking-wide mb-3">
                      Colour{selectedColor ? ` — ${selectedColor}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          aria-pressed={selectedColor === c}
                          className={`px-4 h-9 border text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                            selectedColor === c
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm text-muted-foreground tracking-wide mb-3">Size</p>
                    <div className="flex gap-3">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size as string)}
                          aria-label={`Select size ${size}`}
                          aria-pressed={selectedSize === size}
                          className={`w-12 h-12 border text-sm tracking-wider transition-colors duration-300 ${
                            selectedSize === size
                              ? "border-foreground bg-foreground text-background"
                              : "border-border text-foreground hover:border-foreground"
                          }`}
                        >
                          {size as string}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to cart placeholder */}
                <button
                  disabled={!product.stock_quantity || product.stock_quantity <= 0}
                  className="w-full py-4 bg-foreground text-background text-sm tracking-[0.2em] uppercase opacity-40 cursor-not-allowed mb-4"
                >
                  Add to bag — coming soon
                </button>
                <p className="text-xs text-muted-foreground text-center tracking-wide">
                  {product.stock_quantity && product.stock_quantity > 0
                    ? "Purchasing will be available soon"
                    : "Currently unavailable"}
                </p>

                {/* Materials & Care */}
                {(product.materials || product.care_info) && (
                  <div className="mt-10 pt-8 border-t border-border space-y-4">
                    {product.materials && (
                      <div>
                        <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-1">Materials</p>
                        <p className="text-sm text-foreground/80">{product.materials}</p>
                      </div>
                    )}
                    {product.care_info && (
                      <div>
                        <p className="text-xs text-muted-foreground tracking-[0.15em] uppercase mb-1">Care</p>
                        <p className="text-sm text-foreground/80">{product.care_info}</p>
                      </div>
                    )}
                  </div>
                )}
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Long description / editorial */}
      {product.long_description && (
        <section className="luxury-section">
          <div className="luxury-container text-center">
            <ScrollFadeIn>
              <h2 className="luxury-heading mb-6">The making</h2>
            </ScrollFadeIn>
            <ScrollFadeIn delay={0.15}>
              <p className="luxury-body mx-auto text-center">{product.long_description}</p>
            </ScrollFadeIn>
          </div>
        </section>
      )}

      {/* Related */}
      {filtered.length > 0 && (
        <section className="luxury-section border-t border-border">
          <div className="luxury-container">
            <ScrollFadeIn>
              <h2 className="luxury-heading text-center mb-12">You may also appreciate</h2>
            </ScrollFadeIn>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 md:gap-x-6 gap-y-10">
              {filtered.map((item, i) => (
                <ScrollFadeIn key={item.slug} delay={i * 0.08}>
                  <Link to={`/product/${item.slug}`} className="group block">
                    <div className="relative overflow-hidden mb-4 bg-secondary aspect-[3/4]">
                      <img
                        src={item.thumbnail_url || garmentImage}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <h3 className="font-serif font-light text-base tracking-wide text-foreground mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground tracking-wide">{formatPrice(item.price)}</p>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default ProductPage;
