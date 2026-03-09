import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface FullScreenMenuProps {
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

const FullScreenMenu = ({ isOpen, onClose }: FullScreenMenuProps) => {
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);

  const handleClose = () => {
    setActiveMenu(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col"
        >
          {/* Top bar */}
          <div className="luxury-container flex items-center justify-between h-16 md:h-20">
            <div />
            <span className="luxury-heading-lg !text-[clamp(18px,2vw,24px)] tracking-[0.2em]">
              R U V T I E R
            </span>
            <button onClick={handleClose} className="luxury-button p-2" aria-label="Close menu">
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Menu content */}
          <div className="flex-1 flex items-center">
            <div className="luxury-container w-full flex flex-col md:flex-row gap-16 md:gap-24">
              {/* Main categories */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col gap-8"
              >
                <button
                  onClick={() => setActiveMenu(activeMenu === "boutique" ? null : "boutique")}
                  className="luxury-heading !text-left !text-[clamp(24px,3vw,36px)] luxury-button !p-0"
                >
                  Explore Online Boutique
                </button>
                <button
                  onClick={() => setActiveMenu(activeMenu === "stillness" ? null : "stillness")}
                  className="luxury-heading !text-left !text-[clamp(24px,3vw,36px)] luxury-button !p-0"
                >
                  Stillness
                </button>
                <button
                  onClick={() => setActiveMenu(activeMenu === "home" ? null : "home")}
                  className="luxury-heading !text-left !text-[clamp(24px,3vw,36px)] luxury-button !p-0"
                >
                  Home Interior
                </button>
              </motion.div>

              {/* Subcategories */}
              <AnimatePresence mode="wait">
                {activeMenu && (
                  <motion.div
                    key={activeMenu}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-4"
                  >
                    {activeMenu === "boutique" &&
                      boutiqueSubcategories.map((item) => (
                        <a key={item} href="#" className="luxury-button !text-[16px] !text-left w-fit">
                          {item}
                        </a>
                      ))}
                    {activeMenu === "home" &&
                      homeInteriorSubcategories.map((item) => (
                        <a key={item} href="#" className="luxury-button !text-[16px] !text-left w-fit">
                          {item}
                        </a>
                      ))}
                    {activeMenu === "stillness" && (
                      <div className="max-w-[600px]">
                        <p className="luxury-body italic mb-8">
                          "Every fibre carries origin, landscape, and time. We begin there, in silence."
                        </p>
                        <a href="#" className="luxury-button">
                          Enter Stillness
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenMenu;
