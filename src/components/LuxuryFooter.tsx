import { Link } from "react-router-dom";
import ScrollFadeIn from "./ScrollFadeIn";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  return (
    <footer className="border-t border-border" style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}>
      <div className="luxury-container">
        {/* Newsletter */}
        <ScrollFadeIn>
          <div className="flex flex-col items-center text-center mb-16 md:mb-20">
            <button onClick={onSubscribeClick} className="luxury-button !text-[13px]">
              Subscribe to our newsletter
            </button>
          </div>
        </ScrollFadeIn>

        {/* Two-column links */}
        <ScrollFadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 max-w-xl mx-auto mb-16 md:mb-20">
            {/* Left column */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Link to="/appointments" className="luxury-button !text-[12px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
                Private Appointment
              </Link>
              <Link to="/craft-career" className="luxury-button !text-[12px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
                Craft Career
              </Link>
              <Link to="/contact" className="luxury-button !text-[12px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
                Contact
              </Link>
            </div>

            {/* Right column */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <Link to="/find-boutique" className="luxury-button !text-[12px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
                Find a Boutique
              </Link>
              <Link to="/boutique" className="luxury-button !text-[12px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
                Explore Online Boutique
              </Link>
            </div>
          </div>
        </ScrollFadeIn>

        {/* Social links */}
        <ScrollFadeIn delay={0.15}>
          <div className="flex items-center justify-center gap-8 mb-10">
            <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" className="luxury-button !text-[11px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
              Instagram
            </a>
            <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" className="luxury-button !text-[11px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
              YouTube
            </a>
            <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" className="luxury-button !text-[11px] !p-0 tracking-[0.1em] uppercase text-muted-foreground">
              Pinterest
            </a>
          </div>
        </ScrollFadeIn>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-muted-foreground text-[11px] tracking-[0.08em]">
            © {new Date().getFullYear()} RUVTIER. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
