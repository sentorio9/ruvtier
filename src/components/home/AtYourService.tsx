/**
 * AtYourService — text-led service block on the warm ivory inset.
 *
 * Four columns, serif titles + one-line stone descriptions. No image,
 * no charcoal band — sits on the unified warm inset (#EAE4D8) with
 * hairlines top and bottom.
 */
import { Link } from "react-router-dom";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { HOME_SERVICES } from "@/content/brand";

const AtYourService = () => (
  <section className="bg-warm-1 hairline-top hairline-bottom section-pad-md">
    <div className="luxury-container w-full">
      <ScrollFadeIn>
        <h2 className="type-display text-center mb-10 md:mb-14">
          {HOME_SERVICES.heading}
        </h2>
      </ScrollFadeIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[clamp(20px,3vw,40px)] gap-y-10">
        {HOME_SERVICES.items.map((item, i) => (
          <ScrollFadeIn key={item.title} delay={i * 0.1}>
            <Link to={item.to} className="group flex flex-col items-start text-left">
              <h3 className="font-serif font-light text-foreground text-[clamp(18px,1.6vw,22px)] leading-[1.3] tracking-[0.04em]">
                <span className="relative inline-block pb-1">
                  {item.title}
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  />
                </span>
              </h3>
              <p className="font-sans font-light text-muted-foreground text-[clamp(13px,0.95vw,15px)] leading-[1.6] mt-3 md:mt-4">
                {item.body}
              </p>
            </Link>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default AtYourService;
