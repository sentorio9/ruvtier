import { Link } from "react-router-dom";
import { useState } from "react";

interface LuxuryFooterProps {
  onSubscribeClick?: () => void;
}

const linkClass =
  "text-[11px] tracking-[0.08em] font-light opacity-80 hover:opacity-100 transition-opacity duration-300 leading-relaxed";

const headingClass =
  "font-serif text-[13px] tracking-[0.12em] font-light mb-4";

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // Route to mailto or use onSubscribeClick
    if (onSubscribeClick) {
      onSubscribeClick();
    } else {
      const subject = encodeURIComponent("Newsletter Subscription");
      const body = encodeURIComponent(`New subscriber:\n\nEmail: ${email}`);
      window.open(`mailto:theruvtier@gmail.com?subject=${subject}&body=${body}`, "_self");
    }
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer>
      {/* ── Upper: Terracotta Red Section ── */}
      <div className="bg-[hsl(var(--footer-red))]" style={{ color: "hsl(var(--footer-red-foreground))" }}>
        <div className="max-w-[var(--content-max)] mx-auto px-6 md:px-10">

          {/* Newsletter */}
          <div className="flex flex-col items-center text-center pt-14 md:pt-20 pb-10 md:pb-14">
            <h3 className="font-serif text-[clamp(18px,2vw,24px)] font-light tracking-[0.1em] mb-3">
              Subscribe to our newsletter
            </h3>
            <p className="font-sans text-[12px] font-light tracking-[0.06em] opacity-70 max-w-md mb-8 leading-relaxed">
              Receive our newsletter and discover our world, collections, and latest news from us.
            </p>

            {subscribed ? (
              <p className="font-sans text-[12px] font-light tracking-[0.08em] opacity-80">
                Thank you for subscribing to Ruvtier.
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-0 w-full max-w-xs border-b border-current/30">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Email address"
                  className="flex-1 bg-transparent py-3 font-sans text-[12px] tracking-[0.06em] placeholder:opacity-50 focus:outline-none"
                  style={{ color: "inherit" }}
                />
                <button type="submit" aria-label="Subscribe" className="p-2 opacity-70 hover:opacity-100 transition-opacity">
                  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <line x1="0" y1="6" x2="16" y2="6" />
                    <polyline points="12,1 17,6 12,11" />
                  </svg>
                </button>
              </form>
            )}

            <p className="font-sans text-[9px] font-light tracking-[0.04em] opacity-40 max-w-sm mt-5 leading-relaxed">
              I acknowledge that my email address will be processed by RUVTIER in accordance with the provisions of the{" "}
              <Link to="/privacy-policy" className="underline hover:opacity-70 transition-opacity">Privacy Policy</Link>.
            </p>
          </div>

          {/* Separator */}
          <div className="w-full h-px opacity-15 bg-current" />

          {/* Four-column links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 py-10 md:py-14 max-w-3xl mx-auto">
            {/* Services */}
            <div className="flex flex-col gap-2">
              <h4 className={headingClass}>Services</h4>
              <Link to="/rituals-of-care" className={linkClass}>Care & Restoration</Link>
              <Link to="/boutique" className={linkClass}>Explore Boutique</Link>
              <Link to="/shipping" className={linkClass}>Delivery & Shipping</Link>
            </div>

            {/* Get in touch */}
            <div className="flex flex-col gap-2">
              <h4 className={headingClass}>Get in touch</h4>
              <Link to="/contact" className={linkClass}>Contact</Link>
              <Link to="/faq" className={linkClass}>FAQ</Link>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2">
              <h4 className={headingClass}>Company</h4>
              <Link to="/the-house" className={linkClass}>House Philosophy</Link>
              <Link to="/craft-career" className={linkClass}>Career</Link>
              <Link to="/find-boutique" className={linkClass}>Find a Boutique</Link>
            </div>

            {/* Legal & Cookies */}
            <div className="flex flex-col gap-2">
              <h4 className={headingClass}>Legal & Cookies</h4>
              <Link to="/terms" className={linkClass}>Terms & Conditions</Link>
              <Link to="/privacy-policy" className={linkClass}>Privacy & Cookie Notice</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lower: Beige Strip ── */}
      <div className="bg-[hsl(var(--footer-beige))]" style={{ color: "hsl(var(--footer-beige-foreground))" }}>
        <div className="max-w-[var(--content-max)] mx-auto px-6 md:px-10 py-8 md:py-10 flex flex-col items-center gap-5">

          {/* Logo / Brand mark */}
          <p className="font-serif text-[clamp(16px,1.8vw,22px)] font-light tracking-[0.18em]">
            RUVTIER
          </p>

          {/* Social row */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {[
              { label: "Instagram", href: "https://www.instagram.com/ruvtier/" },
              { label: "YouTube", href: "https://www.youtube.com/@ruvtier" },
              { label: "Pinterest", href: "https://uk.pinterest.com/RUVTIER/_created/" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow RUVTIER on ${label}`}
                className="text-[10px] tracking-[0.08em] font-light opacity-60 hover:opacity-100 transition-opacity duration-300"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-[9px] tracking-[0.06em] font-light opacity-40">
            © {new Date().getFullYear()} RUVTIER · All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LuxuryFooter;
