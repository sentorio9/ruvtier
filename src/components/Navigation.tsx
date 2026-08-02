/**
 * Navigation — fixed two-row header on desktop, single utility row on
 * mobile. Holds the wordmark and opens every chrome drawer.
 *
 * Triggers: SlideMenu (`FullScreenMenu`), CartDrawer,
 * ClientLoungeDrawer, SearchOverlay, ShippingRegionModal.
 *
 * Used by: every page via `<Navigation />` at the top of the layout.
 *
 * Design-system dependencies: `.luxury-button`, `.luxury-heading-lg`
 * for the wordmark at `tracking-[0.28em]`, hairline border `--border`,
 * 0.6-stroke custom SVG icons (menu, search, cart). No props — all
 * chrome state is local.
 */
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import SlideMenu from "./FullScreenMenu";
import CartDrawer from "./CartDrawer";
import ClientLoungeDrawer from "./ClientLoungeDrawer";
import SearchOverlay from "./SearchOverlay";
import ShippingRegionModal from "./ShippingRegionModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useT } from "@/i18n/useT";
import type { TranslationKey } from "@/i18n/translations";

const CATEGORY_ROUTES: { key: TranslationKey; to: string; matches: (path: string) => boolean }[] = [
  { key: "nav.new_arrival", to: "/new-arrival", matches: (p) => p === "/new-arrival" },
  { key: "nav.collection", to: "/collection", matches: (p) => p === "/collection" },
  { key: "nav.women", to: "/boutique/women", matches: (p) => p === "/boutique/women" || p.startsWith("/boutique/women/") },
  { key: "nav.men", to: "/boutique/men", matches: (p) => p === "/boutique/men" || p.startsWith("/boutique/men/") },
  { key: "nav.by_allocation", to: "/by-allocation", matches: (p) => p === "/by-allocation" },
  { key: "nav.the_house", to: "/the-house", matches: (p) => p.startsWith("/the-house") },
];

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loungeOpen, setLoungeOpen] = useState(false);
  const [loungeInitialView, setLoungeInitialView] = useState<"signin" | "register" | "reset" | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const { t } = useT();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/lounge") {
      const params = new URLSearchParams(location.search);
      const v = params.get("view");
      const mapped: "signin" | "register" | "reset" =
        v === "register" || v === "reset" || v === "signin" ? v : "signin";
      setLoungeInitialView(mapped);
      setLoungeOpen(true);
    }
  }, [location.pathname, location.search]);

  const closeLounge = () => {
    setLoungeOpen(false);
    if (location.pathname === "/lounge") navigate("/", { replace: true });
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md">
        {/* Row 1 — Utility */}
        <div className="mx-auto max-w-[1400px] grid grid-cols-[1fr_auto_1fr] items-center h-[52px] md:h-[56px] px-4 md:px-8 lg:px-12">
          {/* Left */}
          <div className="flex items-center gap-5 md:gap-7">
            <button
              onClick={() => setMenuOpen(true)}
              className="luxury-button !p-1.5"
              aria-label={t("nav.menu")}
            >
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="0.6">
                <line x1="0" y1="1" x2="20" y2="1" />
                <line x1="0" y1="6" x2="20" y2="6" />
                <line x1="0" y1="11" x2="20" y2="11" />
              </svg>
            </button>
            {!isMobile && (
              <button onClick={() => setSearchOpen(true)} className="luxury-button !p-1.5" aria-label={t("nav.search")}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
                  <circle cx="7" cy="7" r="5.5" />
                  <line x1="11" y1="11" x2="15" y2="15" />
                </svg>
              </button>
            )}
          </div>

          {/* Center — Emblem */}
          <Link
            to="/"
            className="luxury-heading-lg !text-[clamp(13px,1.3vw,19px)] tracking-[0.28em] uppercase whitespace-nowrap !leading-none"
          >
            R U V T I E R
          </Link>

          {/* Right */}
          <div className="flex items-center justify-end gap-5 md:gap-7">
            <button
              onClick={() => setShippingOpen(true)}
              className="luxury-button !p-1.5 !text-[10.5px] tracking-[0.18em] uppercase"
              aria-label={`${t("nav.language_change")} (${language.toUpperCase()})`}
            >
              {language.toUpperCase()}
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="luxury-button !p-1.5"
              aria-label={t("nav.cart")}
            >
              <svg width="15" height="17" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="0.6">
                <path d="M1 5.5h14v11.5H1z" />
                <path d="M4.5 5.5V4a3.5 3.5 0 0 1 7 0v1.5" />
              </svg>
            </button>
            {!isMobile && (
              <button
                onClick={() => { setLoungeInitialView(undefined); setLoungeOpen(true); }}
                className="luxury-button !p-1.5 !text-[10.5px] tracking-[0.16em]"
              >
                {t("nav.client_lounge")}
              </button>
            )}
          </div>
        </div>

        {/* Row 2 — Category Navigation (desktop/tablet only) */}
        {!isMobile && (
          <>
            <div className="mx-auto max-w-[1400px] px-4 md:px-8 lg:px-12">
              <div className="border-t border-border" />
            </div>
            <div className="mx-auto max-w-[1400px] flex items-center justify-center h-[40px] px-4 md:px-8 lg:px-12 gap-10 md:gap-14">
              {CATEGORY_ROUTES.map((cat) => {
                const active = cat.matches(location.pathname);
                return (
                  <Link
                    key={cat.to}
                    to={cat.to}
                    aria-current={active ? "page" : undefined}
                    className={`font-sans text-[11.5px] md:text-[12px] font-light tracking-[0.16em] uppercase transition-colors duration-300 ${
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t(cat.key)}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </nav>

      <SlideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenLounge={() => { setLoungeInitialView(undefined); setLoungeOpen(true); }}
      />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ClientLoungeDrawer isOpen={loungeOpen} onClose={closeLounge} initialView={loungeInitialView} />
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShippingRegionModal open={shippingOpen} onClose={() => setShippingOpen(false)} />
    </>
  );
};

export default Navigation;
