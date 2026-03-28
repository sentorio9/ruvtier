import { useState } from "react";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
  onOpenLounge?: () => void;
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

const materialsSubcategories = [
  { label: "Vicuña", slug: "vicuna" },
  { label: "Cashmere", slug: "cashmere" },
  { label: "Merino Wool", slug: "merino-wool" },
  { label: "Silk", slug: "silk" },
  { label: "French Linen", slug: "french-linen" },
];

const homeInteriorSubcategories = [
  { label: "Textiles", slug: "textiles" },
  { label: "Objects", slug: "objects" },
  { label: "Fragrance", slug: "fragrance" },
];

type SubMenuKey = "boutique" | "materials" | "home-interior" | null;

interface SubMenu {
  title: string;
  items: { label: string; slug: string; basePath: string }[];
}

const subMenus: Record<string, SubMenu> = {
  boutique: {
    title: "Online Boutique",
    items: boutiqueSubcategories.map((i) => ({ ...i, basePath: "/boutique" })),
  },
  materials: {
    title: "Materials",
    items: materialsSubcategories.map((i) => ({ ...i, basePath: "/materials" })),
  },
  "home-interior": {
    title: "Home Interior",
    items: homeInteriorSubcategories.map((i) => ({ ...i, basePath: "/boutique" })),
  },
};

/* Luxury-grade transition: slightly slower, custom cubic-bezier for calm motion */
const panelTransition = { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] as const };
const overlayTransition = { duration: 0.45, ease: "easeOut" as const };

const SlideMenu = ({ isOpen, onClose, onOpenSearch, onOpenLounge }: SlideMenuProps) => {
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuKey>(null);
  const isMobile = useIsMobile();
  useBodyScrollLock(isOpen);

  const handleClose = () => {
    setActiveSubMenu(null);
    onClose();
  };

  const handleLinkClick = () => {
    handleClose();
  };

  const menuWidth = isMobile ? "85vw" : "min(30vw, 440px)";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay — soft dim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            className="fixed inset-0 z-[90] bg-foreground/15 backdrop-blur-[1px]"
            onClick={handleClose}
          />

          {/* ── Panel 1: Primary menu ── */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: activeSubMenu ? "-16%" : 0 }}
            exit={{ x: "-100%" }}
            transition={panelTransition}
            className="fixed top-0 left-0 bottom-0 z-[100] bg-background border-r border-border flex flex-col"
            style={{ width: menuWidth }}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[52px] md:h-[64px] px-6">
              <span className="text-[9.5px] tracking-[0.22em] uppercase text-muted-foreground font-sans">
                Menu
              </span>
              <button onClick={handleClose} className="luxury-button !p-1.5" aria-label="Close menu">
                <X size={14} strokeWidth={0.6} />
              </button>
            </div>

            {/* Divider */}
            <div className="mx-6 border-t border-border" />

            {/* Nav items */}
            <nav className="flex-1 flex flex-col justify-center px-8 gap-7 overflow-y-auto">
              {/* Mobile-only utilities */}
              {isMobile && (
                <div className="flex flex-col gap-5 pb-5 border-b border-border mb-2">
                  <button
                    onClick={() => { handleClose(); setTimeout(() => onOpenSearch?.(), 100); }}
                    className="luxury-button !text-left !text-[11.5px] !p-0 flex items-center gap-3 tracking-[0.14em] uppercase"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
                      <circle cx="7" cy="7" r="5.5" />
                      <line x1="11" y1="11" x2="15" y2="15" />
                    </svg>
                    Search
                  </button>
                  <button
                    onClick={() => { handleClose(); setTimeout(() => onOpenLounge?.(), 100); }}
                    className="luxury-button !text-left !text-[11.5px] !p-0 flex items-center gap-3 tracking-[0.14em] uppercase"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
                      <circle cx="8" cy="5" r="3.5" />
                      <path d="M1.5 15c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" />
                    </svg>
                    Client Lounge
                  </button>
                </div>
              )}

              {/* Items with sub-menus */}
              <button
                onClick={() => setActiveSubMenu("boutique")}
                className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider flex items-center justify-between w-full group"
              >
                <span>Explore Online Boutique</span>
                <ChevronRight size={13} strokeWidth={0.6} className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <Link to="/collection" onClick={handleLinkClick} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                The Collection
              </Link>

              <Link to="/stillness" onClick={handleLinkClick} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                Stillness
              </Link>

              <button
                onClick={() => setActiveSubMenu("materials")}
                className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider flex items-center justify-between w-full group"
              >
                <span>Materials</span>
                <ChevronRight size={13} strokeWidth={0.6} className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => setActiveSubMenu("home-interior")}
                className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider flex items-center justify-between w-full group"
              >
                <span>Home Interior</span>
                <ChevronRight size={13} strokeWidth={0.6} className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <Link to="/the-house" onClick={handleLinkClick} className="luxury-button !text-left !text-[clamp(15px,1.6vw,20px)] !p-0 font-serif font-light tracking-wider">
                The House
              </Link>
            </nav>

            {/* Bottom utilities */}
            <div className="px-8 pb-8 pt-4 border-t border-border">
              <div className="flex flex-col gap-3">
                <Link to="/craft-career" onClick={handleLinkClick} className="luxury-button !text-[10.5px] !p-0 tracking-[0.16em] uppercase text-muted-foreground">
                  Craft Career
                </Link>
                <Link to="/find-boutique" onClick={handleLinkClick} className="luxury-button !text-[10.5px] !p-0 tracking-[0.16em] uppercase text-muted-foreground">
                  Find a Boutique
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Panel 2: Sub-menu layer ── */}
          <AnimatePresence>
            {activeSubMenu && subMenus[activeSubMenu] && (
              <motion.div
                key={activeSubMenu}
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={panelTransition}
                className="fixed top-0 left-0 bottom-0 z-[101] bg-background border-r border-border flex flex-col"
                style={{ width: menuWidth }}
              >
                {/* Sub-menu header */}
                <div className="flex items-center h-[52px] md:h-[64px] px-6 gap-3">
                  <button
                    onClick={() => setActiveSubMenu(null)}
                    className="luxury-button !p-1 flex items-center gap-2.5 group"
                    aria-label="Back"
                  >
                    <ArrowLeft size={13} strokeWidth={0.6} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    <span className="text-[9.5px] tracking-[0.2em] uppercase text-muted-foreground font-sans">Back</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="mx-6 border-t border-border" />

                <nav className="flex-1 flex flex-col justify-center px-8 gap-5 overflow-y-auto">
                  <span className="font-serif font-light text-[clamp(20px,2.2vw,28px)] tracking-wider mb-3 text-foreground">
                    {subMenus[activeSubMenu].title}
                  </span>

                  {subMenus[activeSubMenu].items.map((item, i) => (
                    <motion.div
                      key={item.slug}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.035, duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                    >
                      <Link
                        to={`${item.basePath}/${item.slug}`}
                        onClick={handleLinkClick}
                        className="luxury-button !text-[12.5px] md:!text-[13.5px] !text-left w-fit !p-0 tracking-[0.08em]"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideMenu;
