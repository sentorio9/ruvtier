/**
 * AllocationNote — short warm band explaining the house's buying model.
 *
 * Optional CTA opens the existing SubscribePanel (private list) so we
 * keep all subscribe entry points routed through a single drawer.
 */
import ScrollFadeIn from "@/components/ScrollFadeIn";
import { HOME_ALLOCATION } from "@/content/brand";

interface AllocationNoteProps {
  onJoinClick: () => void;
}

const AllocationNote = ({ onJoinClick }: AllocationNoteProps) => (
  <section className="bg-warm-1 hairline-top hairline-bottom section-pad-sm">
    <div className="luxury-container flex flex-col items-center text-center">
      <ScrollFadeIn>
        <h2 className="font-serif font-light text-foreground text-[clamp(22px,2.6vw,34px)] leading-[1.25] tracking-[0.04em] mb-5 md:mb-6">
          {HOME_ALLOCATION.heading}
        </h2>
        <p className="font-sans font-light text-foreground/75 text-[clamp(15px,1.05vw,17px)] leading-[1.7] max-w-[600px] mx-auto">
          {HOME_ALLOCATION.body}
        </p>
      </ScrollFadeIn>
      <ScrollFadeIn delay={0.1}>
        <button
          type="button"
          onClick={onJoinClick}
          className="group inline-flex items-center type-cta tracking-luxury-wide text-foreground mt-7 md:mt-8"
        >
          <span className="relative inline-block pb-1 uppercase">
            {HOME_ALLOCATION.cta}
            <span
              aria-hidden
              className="absolute left-0 right-0 -bottom-px h-px bg-current origin-left scale-x-100 group-hover:scale-x-0 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]"
            />
          </span>
          <span aria-hidden className="ml-2">→</span>
        </button>
      </ScrollFadeIn>
    </div>
  </section>
);

export default AllocationNote;
