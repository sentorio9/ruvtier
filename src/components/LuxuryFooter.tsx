import { useState } from "react";
import { Link } from "react-router-dom";
import RegionSelector from "./RegionSelector";
import ShippingRegionModal from "./ShippingRegionModal";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import { useRegionCurrency } from "@/hooks/useRegionCurrency";
import { useLanguage } from "@/hooks/useLanguage";

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

// Footer typography bumped ~12% to improve legibility while staying editorial.
const linkClass =
  "text-[13px] tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors duration-300 leading-relaxed font-sans";

const headingClass =
  "font-serif tracking-[0.14em] text-foreground mb-4 text-[18px] font-medium";

const newsletterHeadingClass =
  "tracking-[0.14em] font-light text-foreground mb-4 font-sans text-[22px]";

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const { region } = useRegionCurrency();
  const { languageLabel } = useLanguage();

  const servicesHeading = useSiteText("footer_headings", "services", "Services");
  const companyHeading = useSiteText("footer_headings", "company", "Company");
  const touchHeading = useSiteText("footer_headings", "get_in_touch", "Get in touch");
  const legalHeading = useSiteText("footer_headings", "legal", "Legal");
  const newsletterHeading = useSiteText("footer_headings", "newsletter", "Sign up for newsletter");
  const newsletterBlurb = useSiteText("footer_newsletter", "blurb", "Exclusive collections, heritage stories, and special events.");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubscribeClick();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="border-t border-border pt-16 md:pt-24 pb-10 md:pb-14">
      <div className="luxury-container">
        {/* ─── 5-column grid: Newsletter + Nav ─── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-6 md:gap-x-10 max-w-4xl mx-auto mb-12 md:mb-16">
          {/* Services */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="services" label="Footer — Services heading" as="h3" className={headingClass}>{servicesHeading}</Editable>
            <Link to="/rituals-of-care" className={linkClass}>Rituals of Care & Restoration</Link>
            <Link to="/appointments" className={linkClass}>Book a Private Appointment</Link>
            <Link to="/boutique" className={linkClass}>Explore Online Boutique</Link>
            <Link to="/shipping" className={linkClass}>Shipping & Delivery</Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="company" label="Footer — Company heading" as="h3" className={headingClass}>{companyHeading}</Editable>
            <Link to="/the-house" className={linkClass}>House Philosophy</Link>
            <Link to="/craft-career" className={linkClass}>Craft Career</Link>
            <Link to="/find-boutique" className={linkClass}>Find a Boutique</Link>
          </div>

          {/* Get in Touch */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="get_in_touch" label="Footer — Get in touch heading" as="h3" className={headingClass}>{touchHeading}</Editable>
            <Link to="/contact" className={linkClass}>Contact</Link>
            <Link to="/faq" className={linkClass}>FAQ</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="legal" label="Footer — Legal heading" as="h3" className={headingClass}>{legalHeading}</Editable>
            <Link to="/terms" className={linkClass}>Terms & Conditions</Link>
            <Link to="/privacy-policy" className={linkClass}>Privacy & Cookie</Link>
          </div>

          {/* Newsletter - right */}
          <div className="flex flex-col gap-3 col-span-2 md:col-span-1">
            <Editable kind="text_block" contentKey="footer_headings" field="newsletter" label="Footer — Newsletter heading" as="h3" className={newsletterHeadingClass}>{newsletterHeading}</Editable>
            <Editable kind="text_block" contentKey="footer_newsletter" field="blurb" label="Footer — Newsletter blurb" as="p" className="text-[12px] tracking-[0.06em] text-muted-foreground leading-relaxed mb-1">
              {newsletterBlurb}
            </Editable>
            <form onSubmit={handleNewsletterSubmit}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full bg-transparent border-b border-border focus:border-foreground text-[13px] tracking-[0.08em] text-foreground placeholder:text-muted-foreground/60 pb-2 pr-7 outline-none transition-colors duration-300 font-sans"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                  aria-label="Subscribe"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-[11px] tracking-[0.04em] text-muted-foreground/80 leading-relaxed mt-3 font-sans">
                I acknowledge that my email address will be processed by{" "}
                <span className="font-serif tracking-[0.12em]">RUVTIER</span> in accordance with the provisions of the{" "}
                <Link to="/privacy-policy" className="underline-offset-2 hover:underline hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>.
              </p>
              {subscribed && (
                <p className="text-[12px] tracking-[0.06em] text-muted-foreground mt-2 animate-in fade-in">
                  Thank you for your interest.
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="w-full max-w-4xl mx-auto mb-10 md:mb-12">
          <div className="h-px bg-border/60" />
        </div>

        {/* ─── Social Links ─── */}
        <div className="flex items-center justify-center gap-10 md:gap-14 mb-10 md:mb-12">
          <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" aria-label="Follow RUVTIER on Instagram"
            className="flex flex-col items-center gap-2 group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
            </svg>
            <span className={linkClass}>Instagram</span>
          </a>
          <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" aria-label="Watch RUVTIER on YouTube"
            className="flex flex-col items-center gap-2 group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <rect x="2" y="4" width="20" height="16" rx="4" />
              <polygon points="10,8.5 16,12 10,15.5" fill="currentColor" stroke="none" opacity="0.7" />
            </svg>
            <span className={linkClass}>YouTube</span>
          </a>
          <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" aria-label="Discover RUVTIER on Pinterest"
            className="flex flex-col items-center gap-2 group">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 21c1.5-3 2-5.5 2.5-8 .5-2.5 1-3.5 1.5-3.5s1.5 1 1.5 3-1 4-1 4" />
            </svg>
            <span className={linkClass}>Pinterest</span>
          </a>
        </div>

        {/* ─── Copyright + Shipping/Region ─── */}
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-muted-foreground text-[12px] tracking-[0.08em]">
            © {new Date().getFullYear()}{" "}
            <span className="font-serif tracking-[0.12em]">RUVTIER</span>
            . All rights reserved.
          </p>
          <button
            onClick={() => setShippingOpen(true)}
            className="flex items-center gap-2 text-[12px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 self-start md:self-auto"
            aria-label="Choose shipping country and language"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
            </svg>
            <span>Shipping to — {region.country} ({region.currency}) · {languageLabel}</span>
          </button>
        </div>
      </div>
      <ShippingRegionModal open={shippingOpen} onClose={() => setShippingOpen(false)} />
    </footer>
  );
};

export default LuxuryFooter;
