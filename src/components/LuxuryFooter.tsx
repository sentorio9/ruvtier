import { useState } from "react";
import { Link } from "react-router-dom";
import RegionSelector from "./RegionSelector";
import ShippingRegionModal from "./ShippingRegionModal";
import { Editable } from "@/editor/Editable";
import { useSiteText } from "@/editor/useSiteContent";
import { useRegionCurrency } from "@/hooks/useRegionCurrency";
import { useLanguage, getDefaultLanguageForCountry } from "@/hooks/useLanguage";
import { useT } from "@/i18n/useT";
import type { TranslationKey } from "@/i18n/translations";

// One-tap region presets — each preset sets a representative country
// (drives currency + locale) and pairs it with the language most often used
// for browsing that region.
const REGION_PRESETS: { id: string; labelKey: TranslationKey; country: string }[] = [
  { id: "europe", labelKey: "footer.region.europe", country: "FR" },
  { id: "americas", labelKey: "footer.region.americas", country: "US" },
  { id: "asia", labelKey: "footer.region.asia", country: "JP" },
  { id: "middle-east", labelKey: "footer.region.middle_east", country: "AE" },
];

const REGION_COUNTRIES: Record<string, string[]> = {
  europe: ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","MC","NL","PL","PT","RO","SK","SI","ES","SE","CH","UA","GB"],
  americas: ["US","CA","BR","MX"],
  asia: ["HK","JP","KR","CN","SG","AU","TW"],
  "middle-east": ["BH","KW","QA","SA","AE"],
};

function detectActiveRegion(countryCode: string): string | null {
  for (const [id, codes] of Object.entries(REGION_COUNTRIES)) {
    if (codes.includes(countryCode)) return id;
  }
  return null;
}

interface LuxuryFooterProps {
  onSubscribeClick: () => void;
}

// Footer typography bumped ~12% to improve legibility while staying editorial.
const linkClass =
  "text-[13px] tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors duration-300 leading-relaxed font-sans";

const headingClass =
  "font-serif tracking-[0.14em] text-foreground mb-4 text-[18px] font-medium";

const newsletterHeadingClass =
  "font-serif font-light tracking-[0.04em] text-foreground mb-4 text-[clamp(20px,1.6vw,26px)] leading-[1.2]";

const LuxuryFooter = ({ onSubscribeClick }: LuxuryFooterProps) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const { region, setRegion } = useRegionCurrency();
  const { languageLabel, setLanguage } = useLanguage();
  const { t } = useT();
  const activeRegionId = detectActiveRegion(region.countryCode);

  const switchToPreset = (preset: { country: string; id: string }) => {
    // Write language first — setRegion reloads the page once FX rates fetch.
    setLanguage(getDefaultLanguageForCountry(preset.country));
    setRegion(preset.country);
  };

  // Admin overrides (useSiteText) take precedence; otherwise we use the
  // localized label for the active language.
  const servicesHeading = useSiteText("footer_headings", "services", t("footer.services"));
  const companyHeading = useSiteText("footer_headings", "company", t("footer.company"));
  const touchHeading = useSiteText("footer_headings", "get_in_touch", t("footer.get_in_touch"));
  const legalHeading = useSiteText("footer_headings", "legal", t("footer.legal"));
  const newsletterHeading = useSiteText("footer_headings", "newsletter", t("footer.newsletter"));
  const newsletterBlurb = useSiteText("footer_newsletter", "blurb", t("footer.newsletter_blurb"));

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
        {/* ─── Nav columns + Newsletter: editorial 6-col grid ─── */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-y-10 gap-x-6 md:gap-x-10 mb-14 md:mb-20">
          {/* Services */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="services" label="Footer — Services heading" as="h3" className={headingClass}>{servicesHeading}</Editable>
            <Link to="/rituals-of-care" className={linkClass}>{t("footer.services.rituals")}</Link>
            <Link to="/appointments" className={linkClass}>{t("footer.services.appointment")}</Link>
            <Link to="/boutique" className={linkClass}>{t("footer.services.boutique")}</Link>
            <Link to="/shipping" className={linkClass}>{t("footer.services.shipping")}</Link>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="company" label="Footer — Company heading" as="h3" className={headingClass}>{companyHeading}</Editable>
            <Link to="/the-house" className={linkClass}>{t("footer.company.house")}</Link>
            <Link to="/craft-career" className={linkClass}>{t("footer.company.career")}</Link>
            <Link to="/find-boutique" className={linkClass}>{t("footer.company.find_boutique")}</Link>
          </div>

          {/* Get in Touch */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="get_in_touch" label="Footer — Get in touch heading" as="h3" className={headingClass}>{touchHeading}</Editable>
            <Link to="/contact" className={linkClass}>{t("footer.touch.contact")}</Link>
            <Link to="/faq" className={linkClass}>{t("footer.touch.faq")}</Link>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <Editable kind="text_block" contentKey="footer_headings" field="legal" label="Footer — Legal heading" as="h3" className={headingClass}>{legalHeading}</Editable>
            <Link to="/terms-and-conditions" className={linkClass}>{t("footer.legal.terms")}</Link>
            <Link to="/privacy-policy" className={linkClass}>{t("footer.legal.privacy")}</Link>
            <Link to="/cookie-policy" className={linkClass}>Cookie Policy</Link>
            <Link to="/shipping-policy" className={linkClass}>Shipping Policy</Link>
            <Link to="/returns-policy" className={linkClass}>Returns Policy</Link>
            <Link to="/refund-policy" className={linkClass}>Refund Policy</Link>
          </div>

          {/* Newsletter — sits in the same row, spans 2 cols on desktop */}
          <div className="col-span-2 md:col-span-2 flex flex-col">
            <Editable
              kind="text_block"
              contentKey="footer_headings"
              field="newsletter"
              label="Footer — Newsletter heading"
              as="h3"
              className={newsletterHeadingClass}
            >
              {newsletterHeading}
            </Editable>
            <Editable
              kind="text_block"
              contentKey="footer_newsletter"
              field="blurb"
              label="Footer — Newsletter blurb"
              as="p"
              className="text-[13px] tracking-[0.04em] text-muted-foreground leading-[1.7] mb-6 font-sans"
            >
              {newsletterBlurb}
            </Editable>
            <form onSubmit={handleNewsletterSubmit}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.email_placeholder")}
                  maxLength={255}
                  className="w-full bg-transparent border-b border-border focus:border-foreground text-[13px] tracking-[0.06em] text-foreground placeholder:text-muted-foreground/70 pb-3 pr-10 outline-none transition-colors duration-300 font-sans"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-3 text-muted-foreground hover:text-foreground transition-colors duration-300"
                  aria-label={t("footer.subscribe")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <p className="text-[11px] tracking-[0.04em] text-muted-foreground/80 leading-[1.7] mt-5 font-sans">
                {t("footer.privacy_acknowledgement_pre")}{" "}
                <span className="font-serif tracking-[0.12em]">RUVTIER</span>{" "}
                {t("footer.privacy_acknowledgement_mid")}{" "}
                <Link to="/privacy-policy" className="underline-offset-2 hover:underline hover:text-foreground transition-colors">
                  {t("footer.privacy_policy")}
                </Link>.
              </p>
              {subscribed && (
                <p className="text-[12px] tracking-[0.06em] text-muted-foreground mt-3 animate-in fade-in">
                  {t("footer.subscribed")}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ─── Social Links ─── */}
        <div className="flex items-center justify-center gap-10 md:gap-14 mb-10 md:mb-12">
          <a href="https://www.instagram.com/ruvtier/" target="_blank" rel="noopener noreferrer" aria-label="Follow RUVTIER on Instagram"
            className="group">
            <span className={linkClass}>Instagram</span>
          </a>
          <a href="https://www.youtube.com/@ruvtier" target="_blank" rel="noopener noreferrer" aria-label="Watch RUVTIER on YouTube"
            className="group">
            <span className={linkClass}>YouTube</span>
          </a>
          <a href="https://uk.pinterest.com/RUVTIER/_created/" target="_blank" rel="noopener noreferrer" aria-label="Discover RUVTIER on Pinterest"
            className="group">
            <span className={linkClass}>Pinterest</span>
          </a>
        </div>

        {/* ─── Quick region switch ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-y-3 gap-x-2 mb-8 md:mb-10">
          <span className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground/80 sm:mr-4 text-center sm:text-left">
            {t("footer.browse_region")}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {REGION_PRESETS.map((p) => {
              const isActive = activeRegionId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => switchToPreset(p)}
                  aria-pressed={isActive}
                  className={`group relative font-sans text-[11px] tracking-[0.22em] uppercase pb-0.5 transition-colors duration-300 ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="relative inline-block">
                    {t(p.labelKey)}
                    <span
                      aria-hidden
                      className={`absolute left-0 right-0 -bottom-0.5 h-px bg-foreground/70 origin-left transform transition-transform duration-[600ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
                        isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Copyright + Shipping/Region ─── */}
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-muted-foreground text-[12px] tracking-[0.08em]">
            © {new Date().getFullYear()}{" "}
            <span className="font-serif tracking-[0.12em]">RUVTIER</span>
            . {t("footer.rights")}
          </p>
          <button
            onClick={() => setShippingOpen(true)}
            className="flex items-center gap-2 text-[12px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300 self-start md:self-auto"
            aria-label={t("footer.choose_country_lang")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
            </svg>
            <span>{t("footer.shipping_to")} — {region.country} ({region.currency}) · {languageLabel}</span>
          </button>
        </div>
      </div>
      <ShippingRegionModal open={shippingOpen} onClose={() => setShippingOpen(false)} />
    </footer>
  );
};

export default LuxuryFooter;
