/**
 * TheMaking — contained atelier story.
 *
 * Image centred at ~55% width, caption (eyebrow + headline + body +
 * CTA) below. Sits on the unified ivory canvas — no dark overlay, no
 * full-bleed.
 */
import { Link } from "react-router-dom";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { Editable } from "@/editor/Editable";
import { useSiteText, useSiteImage } from "@/editor/useSiteContent";
import { HOME_MAKING } from "@/content/brand";
import makingImage from "@/assets/the-making-atelier.jpg";

const TheMaking = () => {
  const eyebrow = useSiteText("home_making", "eyebrow", HOME_MAKING.eyebrow);
  const headline = useSiteText("home_making", "headline", HOME_MAKING.headline);
  const body = useSiteText("home_making", "body", HOME_MAKING.body);
  const cta = useSiteText("home_making", "cta_label", HOME_MAKING.cta);
  const imageOverride = useSiteImage("site_image_home_making");

  return (
    <section className="bg-background section-pad-md">
      <div className="luxury-container w-full flex flex-col items-center text-center">
        <ScrollFadeIn>
          <Editable
            kind="site_image"
            contentKey="site_image_home_making"
            label="The Making — image"
            as="div"
            className="relative w-full md:w-[55%] mx-auto aspect-[4/3] overflow-hidden bg-secondary"
          >
            <img
              src={imageOverride || makingImage}
              alt="RUVTIER atelier — hands at work"
              width={1600}
              height={1200}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </Editable>
        </ScrollFadeIn>

        <ScrollFadeIn delay={0.1}>
          <Editable
            kind="text_block"
            contentKey="home_making"
            field="eyebrow"
            label="The Making — eyebrow"
            as="p"
            className="type-eyebrow tracking-luxury-wide text-muted-foreground uppercase mt-8 md:mt-10 mb-4 md:mb-5"
          >
            {eyebrow}
          </Editable>
          <Editable
            kind="text_block"
            contentKey="home_making"
            field="headline"
            label="The Making — headline"
            as="h2"
            className="type-display max-w-[18ch] mx-auto"
          >
            {headline}
          </Editable>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.2}>
          <Editable
            kind="text_block"
            contentKey="home_making"
            field="body"
            label="The Making — body"
            as="p"
            className="type-body text-foreground/80 max-w-[52ch] mx-auto mt-5 md:mt-6"
          >
            {body}
          </Editable>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.3}>
          <Link
            to="/the-house"
            className="group inline-flex items-center type-cta tracking-luxury-wide text-foreground mt-7 md:mt-9"
          >
            <span className="relative inline-block pb-1 uppercase">
              <Editable
                kind="text_block"
                contentKey="home_making"
                field="cta_label"
                label="The Making — CTA"
                as="span"
              >
                {cta}
              </Editable>
              <span
                aria-hidden
                className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
              />
            </span>
            <span aria-hidden className="ml-2">→</span>
          </Link>
        </ScrollFadeIn>
      </div>
    </section>
  );
};

export default TheMaking;
