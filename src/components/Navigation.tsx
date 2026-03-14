import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import SlideMenu from "./FullScreenMenu";
import CartDrawer from "./CartDrawer";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between h-[52px] md:h-[64px] px-4 md:px-8 lg:px-12">
          {/* Left cluster */}
          <div className="flex items-center gap-5 md:gap-7 min-w-0">
            {/* Menu */}
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

            {/* Search — hidden on mobile, shown in menu instead */}
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
          <a
            href="/"
            className="absolute left-1/2 -translate-x-1/2 luxury-heading-lg !text-[clamp(13px,1.3vw,19px)] tracking-[0.28em] uppercase whitespace-nowrap !leading-none"
          >
            R U V T I E R
          </a>

          {/* Right cluster */}
          <div className="flex items-center gap-5 md:gap-7 min-w-0">
            {/* Shopping Bag */}
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

            {/* Client Lounge — hidden on mobile, shown in menu instead */}
            {!isMobile && (
              <button className="luxury-button !p-1.5 !text-[10.5px] tracking-[0.16em] uppercase">
                Client Lounge
              </button>
            )}
          </div>
        </div>
      </nav>

      <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navigation;
