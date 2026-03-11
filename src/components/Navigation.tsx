import { useState } from "react";
import { Search } from "lucide-react";
import SlideMenu from "./FullScreenMenu";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-[72px] px-6 md:px-12 lg:px-16">
          {/* Left zone — Menu icon, aligned start */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => setMenuOpen(true)}
              className="luxury-button p-2 !text-foreground"
              aria-label="Open menu"
            >
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" strokeWidth="0.8">
                <line x1="0" y1="1" x2="22" y2="1" />
                <line x1="0" y1="7" x2="22" y2="7" />
                <line x1="0" y1="13" x2="22" y2="13" />
              </svg>
            </button>
          </div>

          {/* Center zone — Logo, truly centered */}
          <div className="flex items-center justify-center">
            <a href="/" className="luxury-heading-lg !text-[clamp(16px,1.6vw,22px)] tracking-[0.22em] uppercase whitespace-nowrap">
              R U V T I E R
            </a>
          </div>

          {/* Right zone — Icons, aligned end */}
          <div className="flex items-center justify-end gap-6 lg:gap-8">
            <button className="luxury-button p-2 hidden md:block" aria-label="Search">
              <Search size={17} strokeWidth={1} />
            </button>
            <button className="luxury-button p-2" aria-label="Shopping bag">
              <svg width="17" height="19" viewBox="0 0 18 20" fill="none" stroke="currentColor" strokeWidth="0.9">
                <path d="M1 6h16v13H1z" />
                <path d="M5 6V4a4 4 0 0 1 8 0v2" />
              </svg>
            </button>
            <button className="luxury-button hidden md:block !text-[11.5px] tracking-[0.14em]">
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
