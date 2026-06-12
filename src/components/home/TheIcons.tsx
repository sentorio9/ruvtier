/**
 * TheIcons — second product set, contained, larger 3-up grid.
 *
 * Sources from the same `useActiveProducts({ featured: true })` query as
 * The Edit; the parent passes in the already-filtered list so we don't
 * duplicate products across the two sets.
 */
import { Link } from "react-router-dom";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import { HOME_ICONS } from "@/content/brand";
import type { Product } from "@/hooks/useProducts";

interface TheIconsProps {
  products: Product[];
  formatPriceWhole: (price: number | null | undefined) => string;
}

const TheIcons = ({ products, formatPriceWhole }: TheIconsProps) => {
  const eyebrow = useSiteText("home_icons", "eyebrow", HOME_ICONS.eyebrow);
  const headline = useSiteText("home_icons", "headline", HOME_ICONS.headline);
  const viewAll = useSiteText("home_icons", "view_all", HOME_ICONS.viewAll);

  const hasProducts = !!products && products.length > 0;

  return (
    <section className="bg-background section-pad-md">
      <div className="luxury-container w-full">
        <ScrollFadeIn>
          <div className="flex items-end justify-between gap-6 pb-5 md:pb-7 border-b border-border mb-8 md:mb-12">
            <div className="flex flex-col items-start">
              <Editable
                kind="text_block"
                contentKey="home_icons"
                field="eyebrow"
                label="The Icons — eyebrow"
                as="span"
                className="type-eyebrow tracking-luxury-wide text-foreground/55 uppercase mb-2 md:mb-3"
              >
                {eyebrow}
              </Editable>
              <Editable
                kind="text_block"
                contentKey="home_icons"
                field="headline"
                label="The Icons — headline"
                as="h2"
                className="type-display"
              >
                {headline}
              </Editable>
            </div>
            <Link to="/collection" className="group hidden md:inline-flex items-center type-cta tracking-luxury-wide shrink-0">
              <span className="relative inline-block pb-1 uppercase">
                <Editable
                  kind="text_block"
                  contentKey="home_icons"
                  field="view_all"
                  label="The Icons — view all"
                  as="span"
                >
                  {viewAll}
                </Editable>
                <span
                  aria-hidden
                  className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                />
              </span>
              <span aria-hidden className="ml-2">→</span>
            </Link>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2.5vw,32px)] gap-y-12">
          {hasProducts
            ? products.slice(0, 3).map((p: any, i: number) => {
            const img = p.hero_image_url || p.thumbnail_url || null;
            const gallery = Array.isArray(p.media_gallery) ? p.media_gallery : [];
            const firstGallery = gallery[0];
            const hoverImg = typeof firstGallery === "string"
              ? firstGallery
              : (firstGallery && typeof firstGallery.url === "string" ? firstGallery.url : null);
            const isPreorder = !!p.preorder_enabled;
            const href = isPreorder ? `/preorder/${p.slug}` : `/product/${p.slug}`;
            const cta = isPreorder ? "Reserve" : "Discover";
            const priceLabel = p.price != null ? formatPriceWhole(p.price) : null;
            return (
              <ScrollFadeIn key={p.id} delay={i * 0.08}>
                <Link to={href} className="group flex flex-col">
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary transition-shadow duration-[800ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:shadow-[0_30px_70px_-32px_rgba(58,58,58,0.28)]">
                    {img ? (
                      <>
                        <img
                          src={img}
                          alt={p.name}
                          loading="lazy"
                          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:scale-[1.03] ${hoverImg ? "[@media(hover:hover)]:group-hover:opacity-0" : ""}`}
                        />
                        {hoverImg && (
                          <img
                            src={hoverImg}
                            alt=""
                            aria-hidden
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-[1100ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:scale-[1.03]"
                          />
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-serif italic">
                        {p.name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-start pt-5 md:pt-6 text-left">
                    <h3 className="font-serif font-light text-foreground text-[16px] md:text-[18px] leading-snug tracking-[0.04em]">
                      {p.name}
                    </h3>
                    <p className="type-eyebrow tracking-luxury-wide text-foreground/55 mt-2 md:mt-3 uppercase">
                      {priceLabel ? <>{priceLabel} <span className="mx-1 opacity-60">·</span> {cta}</> : cta}
                    </p>
                  </div>
                </Link>
              </ScrollFadeIn>
            );
          })
            : Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-secondary" aria-hidden />
                <div className="pt-5 md:pt-6">
                  <p className="type-eyebrow tracking-luxury-wide text-foreground/60 uppercase">
                    Selection temporarily unavailable
                  </p>
                </div>
              </div>
            ))}
        </div>


      </div>
    </section>
  );
};

export default TheIcons;
