import { useState } from "react";
import { X, ChevronRight, ArrowLeft } from "lucide-react";
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

const materialsSubcategories = [
  { label: "Cashmere", slug: "cashmere" },
  { label: "Silk", slug: "silk" },
  { label: "Linen", slug: "linen" },
  { label: "Wool", slug: "wool" },
  { label: "Cotton", slug: "cotton" },
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
    items: homeInteriorSubcategories.map((i) => ({ ...i, basePath: "/home-interior" })),
  },
};

const panelTransition = { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const };

const SlideMenu = ({ isOpen, onClose }: SlideMenuProps) => {
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuKey>(null);
  const isMobile = useIsMobile();

  const handleClose = () => {
    setActiveSubMenu(null);
    onClose();
  };

  const handleLinkClick = () => {
    handleClose();
  };

  const menuWidth = isMobile ? "82vw" : "min(28vw, 420px)";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[90] bg-foreground/20"
            onClick={handleClose}
          />

          {/* Primary panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: activeSubMenu ? "-18%" : 0 }}
            exit={{ x: "-100%" }}
            transition={panelTransition}
            className="fixed top-0 left-0 bottom-0 z-[100] bg-background border-r border-border flex flex-col"
            style={{ width: menuWidth }}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[52px] md:h-[64px] px-5">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-sans">
                Menu
              </span>
              <button onClick={handleClose} className="luxury-button !p-1.5" aria-label="Close menu">
                <X size={15} strokeWidth={0.7} />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 flex flex-col justify-center px-7 gap-6 overflow-y-auto">
              {/* Mobile-only utilities */}
              {isMobile && (
                <div className="flex flex-col gap-4 pb-4 border-b border-border mb-1">
                  <button className="luxury-button !text-left !text-[12px] !p-0 flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.6">
                      <circle cx="7" cy="7" r="5.5" />
                      <line x1="11" y1="11" x2="15" y2="15" />
                    </svg>
                    Search
                  </button>
                  <button className="luxury-button !text-left !text-[12px] !p-0 flex items-center gap-3">
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
                className="luxury-button !text-left !text-[clamp(14px,1.5vw,19px)] !p-0 font-serif font-light tracking-wider flex items-center justify-between w-full"
              >
                <span>Explore Online Boutique</span>
                <ChevronRight size={14} strokeWidth={0.7} className="text-muted-foreground" />
              </button>

              <Link to="/collection" onClick={handleLinkClick} className="luxury-button !text-left !text-[clamp(14px,1.5vw,19px)] !p-0 font-serif font-light tracking-wider">
                The Collection
              </Link>

              <Link to="/stillness" onClick={handleLinkClick} className="luxury-button !text-left !text-[clamp(14px,1.5vw,19px)] !p-0 font-serif font-light tracking-wider">
                Stillness
              </Link>

              <button
                onClick={() => setActiveSubMenu("materials")}
                className="luxury-button !text-left !text-[clamp(14px,1.5vw,19px)] !p-0 font-serif font-light tracking-wider flex items-center justify-between w-full"
              >
                <span>Materials</span>
                <ChevronRight size={14} strokeWidth={0.7} className="text-muted-foreground" />
              </button>

              <button
                onClick={() => setActiveSubMenu("home-interior")}
                className="luxury-button !text-left !text-[clamp(14px,1.5vw,19px)] !p-0 font-serif font-light tracking-wider flex items-center justify-between w-full"
              >
                <span>Home Interior</span>
                <ChevronRight size={14} strokeWidth={0.7} className="text-muted-foreground" />
              </button>

              <Link to="/the-house" onClick={handleLinkClick} className="luxury-button !text-left !text-[clamp(14px,1.5vw,19px)] !p-0 font-serif font-light tracking-wider">
                The House
              </Link>
            </nav>
          </motion.div>

          {/* Secondary panel (sub-menu layer) */}
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
                <div className="flex items-center h-[52px] md:h-[64px] px-5 gap-3">
                  <button
                    onClick={() => setActiveSubMenu(null)}
                    className="luxury-button !p-1 flex items-center gap-2"
                    aria-label="Back"
                  >
                    <ArrowLeft size={14} strokeWidth={0.7} />
                    <span className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground font-sans">Back</span>
                  </button>
                </div>

                <nav className="flex-1 flex flex-col justify-center px-7 gap-5 overflow-y-auto">
                  <span className="font-serif font-light text-[clamp(18px,2vw,26px)] tracking-wider mb-2 text-foreground">
                    {subMenus[activeSubMenu].title}
                  </span>

                  {subMenus[activeSubMenu].items.map((item) => (
                    <Link
                      key={item.slug}
                      to={`${item.basePath}/${item.slug}`}
                      onClick={handleLinkClick}
                      className="luxury-button !text-[12px] md:!text-[13px] !text-left w-fit !p-0"
                    >
                      {item.label}
                    </Link>
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
