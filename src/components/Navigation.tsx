import { useState } from "react";
import { Menu, ShoppingBag, User } from "lucide-react";
import FullScreenMenu from "./FullScreenMenu";

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="luxury-container flex items-center justify-between h-16 md:h-20">
          {/* Left — Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="luxury-button p-2 !text-foreground"
            aria-label="Open menu"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>

          {/* Center — Logo */}
          <a href="/" className="luxury-heading-lg !text-[clamp(18px,2vw,24px)] tracking-[0.2em]">
            R U V T I E R
          </a>

          {/* Right — Icons */}
          <div className="flex items-center gap-5">
            <button className="luxury-button p-2" aria-label="Shopping bag">
              <ShoppingBag size={18} strokeWidth={1.5} />
            </button>
            <button className="luxury-button p-2 hidden md:block" aria-label="Account">
              <User size={18} strokeWidth={1.5} />
            </button>
            <button className="luxury-button hidden md:block !text-[12px]">
              Client Access
            </button>
          </div>
        </div>
      </nav>

      <FullScreenMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Navigation;
