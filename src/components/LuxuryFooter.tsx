import { useState } from "react";
import { Link } from "react-router-dom";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

const linkClass =
  "text-[11px] tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors duration-300 leading-relaxed";

const headingClass =
  "font-serif text-[13px] tracking-[0.14em] font-light text-foreground mb-4";

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Trigger the full subscribe panel for complete signup
    onSubscribeClick();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="relative bg-accent/40 pt-14 md:pt-20 pb-8 md:pb-10">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="luxury-container relative">
        {/* ─── Newsletter Section ─── */}
        <div className="flex flex-col items-center text-center mb-10 md:mb-14 max-w-md mx-auto">
          <h3 className="font-serif text-[18px] md:text-[20px] tracking-[0.14em] font-light text-foreground mb-3">
            Subscribe to our newsletter
          </h3>
          <p className="text-[11px] tracking-[0.06em] text-muted-foreground leading-relaxed mb-6">
            Discover exclusive collections, heritage stories, and special events.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="w-full max-w-xs">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-transparent border-b border-border focus:border-foreground text-[12px] tracking-[0.08em] text-foreground placeholder:text-muted-foreground/60 pb-2.5 pr-8 outline-none transition-colors duration-300 font-sans"
                required
              />
              <button
                type="submit"
                className="absolute right-0 bottom-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                aria-label="Subscribe"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {subscribed && (
              <p className="text-[10px] tracking-[0.06em] text-muted-foreground mt-3 animate-in fade-in">
                Thank you for your interest.
              </p>
            )}
          </form>
        </div>

        {/* ─── First Divider ─── */}
        <div className="w-full max-w-4xl mx-auto mb-10 md:mb-14">
          <div className="h-px bg-border/60" />
        </div>

        {/* ─── Navigation Columns ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-6 md:gap-x-8 max-w-2xl mx-auto mb-10 md:mb-14">
          {/* Services */}
          <div className="flex flex-col gap-3">
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

          {/* Company */}
          <div className="flex flex-col gap-3">
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

          {/* Get in Touch */}
          <div className="flex flex-col gap-3">
            <h3 className={headingClass}>Get in touch</h3>
            <Link to="/contact" className={linkClass}>
              Contact
            </Link>
            <Link to="/faq" className={linkClass}>
              FAQ
            </Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h3 className={headingClass}>Legal</h3>
            <Link to="/terms" className={linkClass}>
              Terms & Conditions
            </Link>
            <Link to="/privacy-policy" className={linkClass}>
              Privacy & Cookie
            </Link>
          </div>
        </div>

        {/* ─── Second Divider ─── */}
        <div className="w-full max-w-4xl mx-auto mb-8 md:mb-10">
          <div className="h-px bg-border/60" />
        </div>

        {/* ─── Social Links ─── */}
        <div className="flex items-center justify-center gap-10 md:gap-14 mb-8 md:mb-10">
          <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" aria-label="Follow RUVTIER on Instagram"
            className="flex flex-col items-center gap-2 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
            <span className={linkClass}>Instagram</span>
          </a>
          <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" aria-label="Watch RUVTIER on YouTube"
            className="flex flex-col items-center gap-2 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <rect x="2" y="4" width="20" height="16" rx="4" />
              <polygon points="10,8.5 16,12 10,15.5" fill="currentColor" stroke="none" opacity="0.7" />
            </svg>
            <span className={linkClass}>YouTube</span>
          </a>
          <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" aria-label="Discover RUVTIER on Pinterest"
            className="flex flex-col items-center gap-2 group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 21c1.5-3 2-5.5 2.5-8 .5-2.5 1-3.5 1.5-3.5s1.5 1 1.5 3-1 4-1 4" />
            </svg>
            <span className={linkClass}>Pinterest</span>
          </a>
        </div>

        {/* ─── Copyright ─── */}
        <div className="text-center">
          <p className="text-muted-foreground text-[10px] tracking-[0.08em]">
            © {new Date().getFullYear()}{" "}
            <span className="font-serif tracking-[0.12em]">RUVTIER</span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
