import { Link } from "react-router-dom";
import ScrollFadeIn from "./ScrollFadeIn";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  return (
    <footer className="py-20 md:py-28 border-t border-border">
      <div className="luxury-container">
        <ScrollFadeIn>
          <div className="flex flex-col items-center text-center gap-8">
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
            <Link to="/craft-career" className="luxury-button !text-[13px]">
              Craft Career
            </Link>
            <Link to="/appointments" className="luxury-button !text-[13px]">
              Private Appointments
            </Link>
            <Link to="/find-boutique" className="luxury-button !text-[13px]">
              Find a Boutique
            </Link>

            <div className="flex gap-8 mt-4">
              {["Instagram", "YouTube", "Pinterest"].map((social) => (
                <a key={social} href="#" className="luxury-button !text-[12px]">
                  {social}
                </a>
              ))}
            </div>

            <p className="text-muted-foreground text-xs tracking-wide mt-6">
              © {new Date().getFullYear()} RUVTIER. All rights reserved.
            </p>
          </div>
        </ScrollFadeIn>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
