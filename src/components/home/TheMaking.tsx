/**
 * TheMaking — full-bleed editorial story band beneath Material is Memory.
 *
 * Atmospheric atelier image with a centred text overlay introducing the
 * single-maker craft narrative. Reuses ScrollFadeIn (single house motion
 * primitive) and the editable text pattern.
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
    <section className="relative w-full min-h-[55vh] md:min-h-[60vh] overflow-hidden">
      <Editable
        kind="site_image"
        contentKey="site_image_home_making"
        label="The Making — background image"
        as="div"
        className="absolute inset-0"
      >
        <img
          src={imageOverride || makingImage}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </Editable>
      <div className="absolute inset-0 bg-[#1E1C18]/55 pointer-events-none" />

      <div className="relative z-10 luxury-container section-pad-md flex flex-col items-center text-center min-h-[55vh] md:min-h-[60vh] justify-center">
        <ScrollFadeIn>
          <Editable
            kind="text_block"
            contentKey="home_making"
            field="eyebrow"
            label="The Making — eyebrow"
            as="p"
            className="type-eyebrow tracking-luxury-wide text-[#F7F5F0]/70 uppercase mb-5 md:mb-6"
          >
            {eyebrow}
          </Editable>
          <Editable
            kind="text_block"
            contentKey="home_making"
            field="headline"
            label="The Making — headline"
            as="h2"
            className="font-serif font-light text-[#F7F5F0] text-[clamp(26px,3.6vw,52px)] leading-[1.18] tracking-[0.04em] max-w-[18ch] mx-auto"
          >
            {headline}
          </Editable>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.12}>
          <Editable
            kind="text_block"
            contentKey="home_making"
            field="body"
            label="The Making — body"
            as="p"
            className="font-sans font-light text-[#F7F5F0]/85 text-[clamp(15px,1.05vw,17px)] leading-[1.7] max-w-[52ch] mx-auto mt-6 md:mt-7"
          >
            {body}
          </Editable>
        </ScrollFadeIn>
        <ScrollFadeIn delay={0.2}>
          <Link
            to="/the-house"
            className="group inline-flex items-center type-cta tracking-luxury-wide text-[#F7F5F0] mt-8 md:mt-10"
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
                className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
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
