import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import SlideMenu from "./FullScreenMenu";
import CartDrawer from "./CartDrawer";
import ClientLoungeDrawer from "./ClientLoungeDrawer";
import SearchOverlay from "./SearchOverlay";

const categories = [
  { label: "Women", to: "/boutique/women" },
  { label: "Men", to: "/boutique/men" },
  { label: "Lifestyle", to: "/boutique/lifestyle" },
  { label: "Book Appointment", to: "/appointments" },
];

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loungeOpen, setLoungeOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        {/* Row 1 — Utility */}
        <div className="mx-auto max-w-[1400px] grid grid-cols-[1fr_auto_1fr] items-center h-[52px] md:h-[56px] px-4 md:px-8 lg:px-12">
          {/* Left */}
          <div className="flex items-center gap-5 md:gap-7">
            <button
              onClick={() => setMenuOpen(true)}
              className="luxury-button !p-1.5"
              aria-label="Open menu"
            >
              <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="0.6">
                <line x1="0" y1="1" x2="20" y2="1" />
                <line x1="0" y1="6" x2="20" y2="6" />
                <line x1="0" y1="11" x2="20" y2="11" />
              </svg>
            </button>
            {!isMobile && (
              <button className="luxury-button !p-1.5" aria-label="Search">
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
              onClick={() => setCartOpen(true)}
              className="luxury-button !p-1.5"
              aria-label="Shopping bag"
            >
              <svg width="15" height="17" viewBox="0 0 16 18" fill="none" stroke="currentColor" strokeWidth="0.6">
                <path d="M1 5.5h14v11.5H1z" />
                <path d="M4.5 5.5V4a3.5 3.5 0 0 1 7 0v1.5" />
              </svg>
            </button>
            {!isMobile && (
              <button
                onClick={() => setLoungeOpen(true)}
                className="luxury-button !p-1.5 !text-[10.5px] tracking-[0.16em] uppercase"
              >
                Client Lounge
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
              {categories.map((cat) => (
                <Link
                  key={cat.to}
                  to={cat.to}
                  className="font-sans text-[11.5px] md:text-[12px] font-light tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ClientLoungeDrawer isOpen={loungeOpen} onClose={() => setLoungeOpen(false)} />
    </>
  );
};

export default Navigation;
