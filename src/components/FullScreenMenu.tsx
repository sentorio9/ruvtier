import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const boutiqueSubcategories = [
  "Lifestyle", "Men", "Women", "Children",
  "Footwear", "Made-to-Measure", "Home Interiors",
  "Leather Goods", "Accessories",
];

const homeInteriorSubcategories = [
  "Home Decor", "Gifts for the Home", "Homeware",
];

type ActiveMenu = null | "boutique" | "stillness" | "home";

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
          {/* Dim backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] bg-foreground/20"
            onClick={handleClose}
          />

          {/* Slide panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[100] w-[85vw] sm:w-[40vw] lg:w-[25vw] bg-background border-r border-border flex flex-col"
          >
            {/* Close */}
            <div className="flex items-center justify-end h-16 md:h-20 px-6">
              <button onClick={handleClose} className="luxury-button p-2" aria-label="Close menu">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            {/* Menu items */}
            <div className="flex-1 flex flex-col justify-center px-8 gap-10">
              <button
                onClick={() => setActiveMenu(activeMenu === "boutique" ? null : "boutique")}
                className="luxury-button !text-left !text-[clamp(18px,2vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                Explore Online Boutique
              </button>
              <button
                onClick={() => setActiveMenu(activeMenu === "stillness" ? null : "stillness")}
                className="luxury-button !text-left !text-[clamp(18px,2vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                Stillness
              </button>
              <button
                onClick={() => setActiveMenu(activeMenu === "home" ? null : "home")}
                className="luxury-button !text-left !text-[clamp(18px,2vw,22px)] !p-0 font-serif font-light tracking-wider"
              >
                Home Interior
              </button>

              {/* Subcategories */}
              <AnimatePresence mode="wait">
                {activeMenu && (
                  <motion.div
                    key={activeMenu}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-3 pl-2 border-l border-border"
                  >
                    {activeMenu === "boutique" &&
                      boutiqueSubcategories.map((item) => (
                        <a key={item} href="#" className="luxury-button !text-[14px] !text-left w-fit !p-0">
                          {item}
                        </a>
                      ))}
                    {activeMenu === "home" &&
                      homeInteriorSubcategories.map((item) => (
                        <a key={item} href="#" className="luxury-button !text-[14px] !text-left w-fit !p-0">
                          {item}
                        </a>
                      ))}
                    {activeMenu === "stillness" && (
                      <div className="max-w-[280px]">
                        <p className="luxury-body italic text-sm mb-4">
                          "Every fibre carries origin, landscape, and time. We begin there, in silence."
                        </p>
                        <a href="#" className="luxury-button !text-[13px]">
                          Enter Stillness
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SlideMenu;
