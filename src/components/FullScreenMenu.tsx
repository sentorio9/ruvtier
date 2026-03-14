import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const boutiqueSubcategories = [
  { label: "Lifestyle", slug: "lifestyle" },
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Children", slug: "children" },
  { label: "Footwear", slug: "footwear" },
  { label: "Made-to-Measure", slug: "made-to-measure" },
  { label: "Home Interiors", slug: "home-interiors" },
  { label: "Leather Goods", slug: "leather-goods" },
  { label: "Accessories", slug: "accessories" },
];

type ActiveMenu = null | "boutique";

const SlideMenu = ({ isOpen, onClose }: SlideMenuProps) => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setActiveMenu(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-foreground/15"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[100] w-[80vw] sm:w-[38vw] lg:w-[25vw] bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-end h-[52px] md:h-[64px] px-5">
              <button onClick={handleClose} className="luxury-button !p-1.5" aria-label="Close menu">
                <X size={16} strokeWidth={0.8} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center px-7 gap-7 overflow-y-auto">
              {/* Mobile-only: Search & Client Lounge */}
              {isMobile && (
                <div className="flex flex-col gap-5 pb-4 border-b border-border mb-2">
                  <button className="luxury-button !text-left !text-[13px] !p-0 flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
                      <circle cx="7" cy="7" r="5.5" />
                      <line x1="11" y1="11" x2="15" y2="15" />
                    </svg>
                    Search
                  </button>
                  <button className="luxury-button !text-left !text-[13px] !p-0 flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
                      <circle cx="8" cy="5" r="3.5" />
                      <path d="M1.5 15c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
                    </svg>
                    Client Lounge
                  </button>
                </div>
              )}

              <button
                onClick={() => setActiveMenu(activeMenu === "boutique" ? null : "boutique")}
                className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider"
              >
                Explore Online Boutique
              </button>

              <AnimatePresence mode="wait">
                {activeMenu === "boutique" && (
                  <motion.div
                    key="boutique"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2.5 pl-2 border-l border-border overflow-hidden"
                  >
                    {boutiqueSubcategories.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/boutique/${item.slug}`}
                        onClick={handleClose}
                        className="luxury-button !text-[12px] md:!text-[13px] !text-left w-fit !p-0"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link to="/collection" onClick={handleClose} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                The Collection
              </Link>
              <Link to="/stillness" onClick={handleClose} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                Stillness
              </Link>
              <Link to="/materials" onClick={handleClose} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                Materials
              </Link>
              <Link to="/home-interior" onClick={handleClose} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                Home Interior
              </Link>
              <Link to="/the-house" onClick={handleClose} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                The House
              </Link>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideMenu;
