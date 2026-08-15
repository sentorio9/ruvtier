/**
 * Private Access — Pre-Order page (`/preorder/:slug`).
 *
 * Editorial intent page. The body presents the garment with quiet
 * conviction; the full request form lives in a side drawer that
 * opens from the single REQUEST ALLOCATION CTA.
 *
 * Layout: gallery (main + up to two thumbnails) · intent column
 * (eyebrow, name, price, description, inline size selector,
 * allocation counter, CTA, fine print, three info accordions).
 */
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LuxuryFooter from "@/components/LuxuryFooter";
import SubscribePanel from "@/components/SubscribePanel";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import PrivateAccessDrawer from "@/components/PrivateAccessDrawer";
import InfoAccordion from "@/components/preorder/InfoAccordion";
import { useProductBySlug, formatPrice, usePriceTick } from "@/hooks/useProducts";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  PREORDER_EYEBROW_PREFIX,
  PREORDER_AVAILABILITY,
  PREORDER_CTA,
  PREORDER_FINEPRINT,
  PREORDER_ALLOCATION_LABEL,
} from "@/content/brand";
import garmentImage from "@/assets/garment-single.jpg";

const PreorderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading } = useProductBySlug(slug);

  usePageMeta({
    title: product?.name ? `${product.name} — Private Access` : "Private Access",
    description: product?.description ?? "Request private access to this RUVTIER garment.",
  });
  usePriceTick();

  // ── Gallery — main + up to two thumbnails ────────────────────────────────
  const gallery = useMemo(() => {
    const raw =
      product?.media_gallery && Array.isArray(product.media_gallery)
        ? (product.media_gallery as string[])
        : [];
    const fallbacks = [product?.hero_image_url, product?.thumbnail_url].filter(Boolean) as string[];
    const all = raw.length > 0 ? raw : fallbacks;
    return all.length > 0 ? all : [garmentImage];
  }, [product]);

  const mainImage = gallery[activeImage] ?? gallery[0];
  const thumbs = gallery.filter((_, i) => i !== activeImage).slice(0, 2);

  // ── Sizes ───────────────────────────────────────────────────────────────
  const sizes: string[] = product?.size_options && Array.isArray(product.size_options)
    ? (product.size_options as string[])
    : ["XS", "S", "M", "L"];

  // ── Allocation status (hidden when edition_size is null) ─────────────────
  // Exact allocation integers are never sent to the browser. The database
  // computes a coarse state (open / limited / closed) which we phrase here.
  const editionSize = (product as any)?.edition_size as number | null | undefined;
  const allocationState = (product as any)?.allocation_state as string | null | undefined;
  const allocationLabel =
    allocationState === "closed"
      ? "Fully allocated"
      : allocationState === "limited"
        ? "Limited allocation remaining"
        : allocationState === "open"
          ? "Allocation open"
          : null;

  if (isLoading) {
    return (
      <div className="relative">
        <Navigation />
        <section className="pt-20 md:pt-28 min-h-[80vh]">
          <div className="luxury-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
              <div className="animate-pulse aspect-square bg-secondary" />
              <div className="animate-pulse space-y-4 pt-8">
                <div className="h-4 bg-secondary w-1/2" />
                <div className="h-10 bg-secondary w-3/4" />
                <div className="h-4 bg-secondary w-1/3" />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="relative">
      <Navigation />

      <section className="pt-20 md:pt-28 pb-20 md:pb-28 min-h-[85vh]">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
            {/* ── LEFT · Gallery ─────────────────────────────────────────── */}
            <ScrollFadeIn>
              <div className="space-y-4">
                <div className="aspect-square bg-secondary overflow-hidden">
                  <img
                    src={mainImage}
                    alt={product?.name || "Garment"}
                    className="w-full h-full object-cover"
                  />
                </div>
                {thumbs.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {thumbs.map((src) => {
                      const realIndex = gallery.indexOf(src);
                      return (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setActiveImage(realIndex)}
                          className="aspect-square bg-secondary overflow-hidden group"
                        >
                          <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            loading="lazy"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollFadeIn>

            {/* ── RIGHT · Intent column ──────────────────────────────────── */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <ScrollFadeIn delay={0.12}>
                {/* Eyebrow */}
                {editionSize ? (
                  <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-muted-foreground mb-5">
                    {PREORDER_EYEBROW_PREFIX} {editionSize}
                  </p>
                ) : (
                  <p className="text-[10px] md:text-xs tracking-[0.22em] uppercase text-muted-foreground mb-5">
                    Private Access
                  </p>
                )}

                {/* Headline */}
                <h1 className="font-serif font-light text-3xl md:text-4xl tracking-wide text-foreground mb-3 leading-tight">
                  {product?.name}
                </h1>

                {/* Price + availability */}
                <p className="text-sm text-muted-foreground tracking-wide mb-6">
                  {formatPrice(product?.price) ?? "Available by allocation"}
                  {formatPrice(product?.price) && ` — ${PREORDER_AVAILABILITY}`}
                </p>

                {/* Description */}
                {product?.description && (
                  <p className="text-sm md:text-base text-foreground/80 leading-relaxed tracking-wide mb-8">
                    {product.description}
                  </p>
                )}

                {/* Size selector */}
                {sizes.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mb-3">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((s) => {
                        const active = selectedSize === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            aria-pressed={active}
                            className={`min-w-[44px] h-11 px-3 border text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-foreground hover:border-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Allocation status */}
                {editionSize && remaining != null && (
                  <div className="mb-6">
                    <div className="flex items-baseline justify-between border-b border-border pb-3">
                      <span className="text-xs tracking-[0.15em] uppercase text-foreground/80">
                        {PREORDER_ALLOCATION_LABEL}
                      </span>
                      <span className="text-xs tracking-wide text-muted-foreground">
                        {remaining} of {editionSize} remaining
                      </span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="w-full py-4 bg-foreground text-background text-xs tracking-[0.25em] uppercase transition-opacity duration-300 hover:opacity-80 mb-4"
                >
                  {PREORDER_CTA}
                </button>

                {/* Fineprint */}
                <p className="text-xs text-muted-foreground tracking-wide text-center mb-10">
                  {PREORDER_FINEPRINT}
                </p>

                {/* Accordions */}
                <div>
                  {(product?.materials || product?.care_info) && (
                    <InfoAccordion label="Composition & care">
                      {product?.materials && <p>{product.materials}</p>}
                      {product?.care_info && <p>{product.care_info}</p>}
                    </InfoAccordion>
                  )}

                  <InfoAccordion label="Fit & measurements">
                    {sizes.length > 0 ? (
                      <p>Offered in {sizes.join(", ")}. Detailed measurements available on request.</p>
                    ) : (
                      <p>Measurements available on request.</p>
                    )}
                  </InfoAccordion>

                  <InfoAccordion label="Provenance & maker">
                    {product?.long_description ? (
                      <p>{product.long_description}</p>
                    ) : (
                      <p>
                        Composed in the atelier under the quiet supervision of the house.
                        Further provenance is shared in correspondence with the client.
                      </p>
                    )}
                  </InfoAccordion>

                  {/* Bottom hairline to close the stack */}
                  <div className="border-t border-border" />
                </div>
              </ScrollFadeIn>
            </div>
          </div>
        </div>
      </section>

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

export default PreorderPage;
