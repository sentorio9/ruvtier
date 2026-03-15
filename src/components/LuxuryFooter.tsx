import { Link } from "react-router-dom";
import ScrollFadeIn from "./ScrollFadeIn";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  return (
    <footer className="border-t border-border" style={{ paddingTop: "var(--section-gap)", paddingBottom: "var(--section-gap)" }}>
      <div className="luxury-container">
        <ScrollFadeIn>
          <div className="flex flex-col items-center text-center gap-6 md:gap-8">
            <button onClick={onSubscribeClick} className="luxury-button !text-[13px]">
              Subscribe to newsletter
            </button>
            <Link to="/contact" className="luxury-button !text-[13px]">
              Contact
            </Link>
            <Link to="/boutique" className="luxury-button !text-[13px]">
              Explore Online Boutique
            </Link>
            <Link to="/the-house" className="luxury-button !text-[13px]">
              The House
            </Link>
            <Link to="/appointments" className="luxury-button !text-[13px]">
              Private Appointments
            </Link>
            <Link to="/find-boutique" className="luxury-button !text-[13px]">
              Find a Boutique
            </Link>

            {/* Contact details */}
            <div className="flex flex-col items-center gap-3 mt-4">
              <a href="mailto:theruvtier@gmail.com" className="luxury-button !text-[12px] tracking-[0.08em]">
                theruvtier@gmail.com
              </a>
              <a href="tel:+447881967338" className="luxury-button !text-[12px] tracking-[0.08em]">
                +44 7881 967338
              </a>
            </div>

            <div className="flex gap-6 md:gap-8 mt-4">
              <a href="https://www.instagram.com/ruvtier" target="_blank" rel="noopener noreferrer" className="luxury-button !text-[12px]">
                Instagram
              </a>
            </div>

            <p className="text-muted-foreground text-xs tracking-wide mt-4">
              © {new Date().getFullYear()} RUVTIER. All rights reserved.
            </p>
          </div>
        </ScrollFadeIn>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
