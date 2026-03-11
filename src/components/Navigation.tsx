import { useState } from "react";
import { Search } from "lucide-react";
import SlideMenu from "./FullScreenMenu";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="luxury-container flex items-center justify-between h-16 md:h-20">
          {/* Left — Menu icon (custom thin lines) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="luxury-button p-2 !text-foreground"
            aria-label="Open menu"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="1">
              <line x1="0" y1="1" x2="20" y2="1" />
              <line x1="0" y1="7" x2="20" y2="7" />
              <line x1="0" y1="13" x2="20" y2="13" />
            </svg>
          </button>

          {/* Center — Logo (only element that stays uppercase) */}
          <a href="/" className="luxury-heading-lg !text-[clamp(18px,2vw,24px)] tracking-[0.2em] uppercase">
            R U V T I E R
          </a>

          {/* Right — Icons */}
          <div className="flex items-center gap-5">
            <button className="luxury-button p-2 hidden md:block" aria-label="Search">
              <Search size={18} strokeWidth={1} />
            </button>
            <button className="luxury-button p-2" aria-label="Shopping bag">
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M1 6h16v13H1z" />
                <path d="M5 6V4a4 4 0 0 1 8 0v2" />
              </svg>
            </button>
            <button className="luxury-button hidden md:block !text-[12px]">
              Client Access
            </button>
          </div>
        </div>
      </nav>

      <SlideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Navigation;
