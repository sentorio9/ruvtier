import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

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
            className="fixed inset-0 z-[90] bg-foreground/20"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[100] w-[85vw] sm:w-[40vw] lg:w-[25vw] bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-end h-14 md:h-20 px-6">
              <button onClick={handleClose} className="luxury-button p-2" aria-label="Close menu">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col justify-center px-8 gap-8 overflow-y-auto">
              <button
                onClick={() => setActiveMenu(activeMenu === "boutique" ? null : "boutique")}
                className="luxury-button !text-left !text-[clamp(16px,1.8vw,22px)] !p-0 font-serif font-light tracking-wider"
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
                    className="flex flex-col gap-3 pl-2 border-l border-border overflow-hidden"
                  >
                    {boutiqueSubcategories.map((item) => (
                      <Link
                        key={item.slug}
                        to={`/boutique/${item.slug}`}
                        onClick={handleClose}
                        className="luxury-button !text-[13px] md:!text-[14px] !text-left w-fit !p-0"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                to="/collection"
                onClick={handleClose}
                className="luxury-button !text-left !text-[clamp(16px,1.8vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                The collection
              </Link>
              <Link
                to="/stillness"
                onClick={handleClose}
                className="luxury-button !text-left !text-[clamp(16px,1.8vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                Stillness
              </Link>
              <Link
                to="/materials"
                onClick={handleClose}
                className="luxury-button !text-left !text-[clamp(16px,1.8vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                Materials
              </Link>
              <Link
                to="/home-interior"
                onClick={handleClose}
                className="luxury-button !text-left !text-[clamp(16px,1.8vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                Home Interior
              </Link>
              <Link
                to="/the-house"
                onClick={handleClose}
                className="luxury-button !text-left !text-[clamp(16px,1.8vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
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
