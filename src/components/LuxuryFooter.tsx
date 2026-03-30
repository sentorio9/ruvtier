import { Link } from "react-router-dom";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const linkClass =
  "text-[11px] tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors duration-300";

const headingClass =
  "text-[11px] tracking-[0.12em] font-medium text-foreground mb-3";

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  return (
    <footer className="border-t border-border py-8 md:py-10">
      <div className="luxury-container">
        {/* Newsletter */}
        <div className="flex flex-col items-center text-center mb-8 md:mb-10">
          <button onClick={onSubscribeClick} className="luxury-button !text-[12px] !normal-case">
            Subscribe to our newsletter
          </button>
        </div>

        {/* Four-column links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 max-w-3xl mx-auto mb-8 md:mb-10">
          {/* Services */}
          <div className="flex flex-col gap-2.5">
            <h3 className={headingClass}>Services</h3>
            <Link to="/rituals-of-care" className={linkClass}>
              Rituals of Care & Restoration
            </Link>
            <Link to="/appointments" className={linkClass}>
              Book a Private Appointment
            </Link>
            <Link to="/boutique" className={linkClass}>
              Explore Online Boutique
            </Link>
            <Link to="/shipping" className={linkClass}>
              Shipping & Delivery
            </Link>
          </div>

          {/* Get in touch */}
          <div className="flex flex-col gap-2.5">
            <h3 className={headingClass}>Get in touch</h3>
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
            <Link to="/faq" className={linkClass}>
              FAQ
            </Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-2.5">
            <h3 className={headingClass}>Company</h3>
            <Link to="/the-house" className={linkClass}>
              House Philosophy
            </Link>
            <Link to="/craft-career" className={linkClass}>
              Craft Career
            </Link>
            <Link to="/find-boutique" className={linkClass}>
              Find a Boutique
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2.5">
            <h3 className={headingClass}>Legal</h3>
            <Link to="/terms" className={linkClass}>
              Terms & Conditions
            </Link>
            <Link to="/privacy-policy" className={linkClass}>
              Privacy & Cookie
            </Link>
          </div>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-8 mb-6">
          <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" aria-label="Follow RUVTIER on Instagram" className={linkClass}>
            Instagram
          </a>
          <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" aria-label="Watch RUVTIER on YouTube" className={linkClass}>
            YouTube
          </a>
          <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" aria-label="Discover RUVTIER on Pinterest" className={linkClass}>
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
