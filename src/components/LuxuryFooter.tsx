import { Link } from "react-router-dom";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  return (
    <footer className="border-t border-border py-8 md:py-10">
      <div className="luxury-container">
        {/* Newsletter */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-10">
          <button onClick={onSubscribeClick} className="luxury-button !text-[12px]">
            Subscribe to our newsletter
          </button>
        </div>

        {/* Two-column links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-16 max-w-xl mx-auto mb-8 md:mb-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link to="/appointments" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Private Appointment
            </Link>
            <Link to="/craft-career" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Craft Career
            </Link>
            <Link to="/contact" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Contact
            </Link>
          </div>
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link to="/find-boutique" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Find a Boutique
            </Link>
            <Link to="/boutique" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Explore Online Boutique
            </Link>
          </div>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" aria-label="Follow RUVTIER on Instagram" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
            Instagram
          </a>
          <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" aria-label="Watch RUVTIER on YouTube" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
            YouTube
          </a>
          <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" aria-label="Discover RUVTIER on Pinterest" className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
            Pinterest
          </a>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-muted-foreground text-[10px] tracking-[0.08em]">
            © {new Date().getFullYear()} RUVTIER. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
