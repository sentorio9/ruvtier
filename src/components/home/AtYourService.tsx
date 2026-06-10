/**
 * AtYourService — full-bleed charcoal service band.
 *
 * Four service columns over the dark band. Each item links to the
 * relevant page with the house underline-on-hover treatment.
 */
import { Link } from "react-router-dom";
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { HOME_SERVICES } from "@/content/brand";

const AtYourService = () => (
  <section className="bg-[#1E1C18] text-[#F7F5F0] section-pad-md">
    <div className="luxury-container w-full">
      <ScrollFadeIn>
        <h2 className="font-serif font-light text-[#F7F5F0] text-[clamp(26px,3.6vw,52px)] leading-[1.18] tracking-[0.04em] text-center mb-12 md:mb-16">
          {HOME_SERVICES.heading}
        </h2>
      </ScrollFadeIn>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-[clamp(20px,3vw,40px)] gap-y-12">
        {HOME_SERVICES.items.map((item, i) => (
          <ScrollFadeIn key={item.title} delay={i * 0.08}>
            <Link to={item.to} className="group flex flex-col items-start text-left">
              <h3 className="font-serif font-light text-[#F7F5F0] text-[clamp(18px,1.6vw,22px)] leading-[1.3] tracking-[0.04em]">
                <span className="relative inline-block pb-1">
                  {item.title}
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-px h-px bg-[#F7F5F0] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                  />
                </span>
              </h3>
              <p className="font-sans font-light text-[#A8A39A] text-[clamp(13px,0.95vw,15px)] leading-[1.6] mt-3 md:mt-4">
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
