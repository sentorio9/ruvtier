/**
 * Product detail page (`/product/:slug`).
 *
 * A single garment composed in editorial silence. The product page
 * applies the same accordion template across every piece: title,
 * gallery, price or Request Allocation, size selector, allocation and
 * appointment CTAs, and info accordions for Material / Fit / Care /
 * Provenance. Redirects to `/preorder/:slug` when preorder is enabled.
 */
import { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import Breadcrumbs from "@/components/Breadcrumbs";
import PrivateAccessDrawer from "@/components/PrivateAccessDrawer";
import InfoAccordion from "@/components/preorder/InfoAccordion";
import { useProductBySlug, useActiveProducts, formatPrice, usePriceTick } from "@/hooks/useProducts";
import { usePageMeta } from "@/hooks/usePageMeta";
import garmentImage from "@/assets/garment-single.jpg";

const AVAILABILITY_COPY: Record<string, string> = {
  in_store: "Available",
  by_allocation: "Available by allocation",
  made_to_measure: "Available by made-to-measure",
  coming_soon: "Coming soon",
};

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: product, isLoading } = useProductBySlug(slug);
  const { data: relatedProducts } = useActiveProducts({ limit: 4 });

  // Redirect to preorder page if preorder is enabled
  useEffect(() => {
    if (product && (product as any).preorder_enabled) {
      navigate(`/preorder/${slug}`, { replace: true });
    }
  }, [product, slug, navigate]);

  const priceLabel = formatPrice(product?.price);
  const availability = ((product as any)?.availability as string | undefined) ?? "in_store";
  const availabilityCopy = AVAILABILITY_COPY[availability] ?? "Available";
  const needsAllocation = !priceLabel || availability === "by_allocation" || availability === "coming_soon";

  const productImageForMeta = (product as any)?.hero_image_url || (product as any)?.thumbnail_url || undefined;
  const productJsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description:
          product.description ||
          `${product.name} by RUVTIER — a luxury garment composed with intention, material devotion, and the quiet art of permanence.`,
        image: productImageForMeta ? [productImageForMeta] : undefined,
        sku: (product as any).sku || undefined,
        brand: { "@type": "Brand", name: "RUVTIER" },
        offers: {
          "@type": "Offer",
          price: product.price ?? 0,
          priceCurrency: "GBP",
          availability:
            (product as any).stock_state && (product as any).stock_state !== "closed"
              ? "https://schema.org/InStock"
              : (product as any).preorder_enabled
                ? "https://schema.org/PreOrder"
                : "https://schema.org/OutOfStock",
          url: `https://ruvtier.com/product/${product.slug}`,
        },
      }
    : undefined;

  usePageMeta({
    title: product?.name ?? "Product",
    description:
      product?.seo_description ||
      product?.description ||
      (product?.name
        ? `${product.name} by RUVTIER — a luxury garment composed from rare fibres and enduring craft, devoted to permanence and material origin.`
        : "A RUVTIER garment composed with intention, material devotion, and the quiet permanence of true luxury."),
    ogType: "product",
    jsonLd: productJsonLd,
  });
  usePriceTick();

  const sizes: string[] = product?.size_options
    ? (Array.isArray(product.size_options) ? product.size_options as string[] : [])
    : [];

  // De-dupe gallery images: never render the same URL twice, even if
  // hero_image_url and thumbnail_url happen to be identical.
  const galleryImages = useMemo(() => {
    const raw: string[] = [
      ...(product?.media_gallery && Array.isArray(product.media_gallery)
        ? (product.media_gallery as string[])
        : []),
      product?.hero_image_url as string | undefined,
      product?.thumbnail_url as string | undefined,
    ].filter(Boolean) as string[];
    return Array.from(new Set(raw));
  }, [product]);

  if (isLoading) {
    return (
      <div className="relative">
        <Navigation />
        <section className="pt-20 md:pt-28">
          <div className="luxury-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="animate-pulse"><div className="aspect-[3/4] bg-secondary" /></div>
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
            <h1 className="luxury-heading mb-4">Piece not found</h1>
            <p className="luxury-body text-muted-foreground mb-8">
              This piece may no longer be available.
            </p>
            <Link to="/collection" className="luxury-button">Return to Collection</Link>
          </div>
        </section>
      </div>
    );
  }

  const filtered = relatedProducts?.filter((p) => p.id !== product.id).slice(0, 3) || [];
  const materials = product.materials?.trim();
  const care = product.care_info?.trim();

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-28 md:pt-32">
        <div className="luxury-container">
          <Breadcrumbs items={[
            { label: "Home", to: "/" },
            { label: "Collection", to: "/collection" },
            { label: product.name },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Gallery */}
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
                  <div className="aspect-[3/4] bg-secondary flex items-center justify-center px-8">
                    <p className="font-serif italic text-foreground/50 text-center text-sm md:text-base leading-relaxed">
                      Photography of {product.name} is in quiet preparation.
                    </p>
                  </div>
                )}
              </div>
            </ScrollFadeIn>

            {/* Details */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <ScrollFadeIn delay={0.15}>
                <p className="font-sans text-[10px] tracking-[0.28em] uppercase text-muted-foreground mb-4">
                  {availabilityCopy}
                </p>
                <h1 className="luxury-heading mb-4">{product.name}</h1>

                <p className="text-muted-foreground text-lg tracking-wide mb-8">
                  {priceLabel ? (
                    <>
                      {priceLabel}
                      {product.compare_at_price && product.compare_at_price > (product.price || 0) && (
                        <span className="ml-3 line-through text-muted-foreground/50 text-base">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-foreground/70">Price available on request</span>
                  )}
                </p>

                {product.description && (
                  <p className="luxury-body mb-8">{product.description}</p>
                )}

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div className="mb-8">
                    <p className="text-sm text-muted-foreground tracking-wide mb-3">Size</p>
                    <div className="flex flex-wrap gap-3">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          aria-label={`Select size ${size}`}
                          aria-pressed={selectedSize === size}
                          className={`w-12 h-12 border text-sm tracking-wider transition-colors duration-300 ${
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
                )}

                {/* CTAs — always Request Allocation for now, plus appointment link */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="w-full py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase transition-opacity duration-300 hover:opacity-80 mb-3"
                >
                  {needsAllocation ? "Request Allocation" : "Request Private Access"}
                </button>
                <Link
                  to={`/appointments?type=collection_viewing`}
                  className="block w-full py-4 border border-border text-foreground text-xs tracking-[0.25em] uppercase text-center transition-colors duration-300 hover:border-foreground mb-6"
                >
                  Book Private Appointment
                </Link>

                <p className="text-xs text-muted-foreground tracking-wide text-center mb-10">
                  Complimentary alterations for life · Size guidance by appointment
                </p>

                {/* Info accordions — always four, safe fall-backs when data missing */}
                <div>
                  <InfoAccordion label="Material">
                    <p>{materials || "Composition confirmed on request. The piece is composed from selected natural fibres in restrained volumes."}</p>
                  </InfoAccordion>
                  <InfoAccordion label="Fit">
                    {sizes.length > 0 ? (
                      <p>Offered in {sizes.join(", ")}. Detailed measurements available on request.</p>
                    ) : (
                      <p>Measurements and fit guidance available by appointment.</p>
                    )}
                  </InfoAccordion>
                  <InfoAccordion label="Care">
                    <p>{care || "Rest between wear. Store folded and away from direct light. Full care guidance provided with each piece."}</p>
                  </InfoAccordion>
                  <InfoAccordion label="Provenance">
                    {product.long_description ? (
                      <p>{product.long_description}</p>
                    ) : (
                      <p>Composed in the atelier under the quiet supervision of the house. Further provenance is shared in correspondence with the client.</p>
                    )}
                  </InfoAccordion>
                  <div className="border-t border-border" />
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* Related */}
      {filtered.length > 0 && (
        <section className="luxury-section border-t border-border mt-16">
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
                    <p className="text-sm text-muted-foreground tracking-wide">
                      {formatPrice(item.price) ?? "Request Allocation"}
                    </p>
                  </Link>
                </ScrollFadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <PrivateAccessDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        product={product}
        defaultSize={selectedSize}
      />

      <LuxuryFooter onSubscribeClick={() => setSubscribeOpen(true)} />
      <SubscribePanel isOpen={subscribeOpen} onClose={() => setSubscribeOpen(false)} />
    </div>
  );
};

export default ProductPage;
