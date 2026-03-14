import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
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
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[100] w-[85vw] sm:w-[40vw] lg:w-[25vw] bg-background border-l border-border flex flex-col"
          >
            <div className="flex items-center justify-between h-14 md:h-20 px-6">
              <h3 className="font-serif font-light text-lg tracking-wider text-foreground">
                Shopping bag
              </h3>
              <button onClick={onClose} className="luxury-button p-2" aria-label="Close cart">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your bag is empty.
              </p>
              <button onClick={onClose} className="luxury-button !text-[13px]">
                Continue browsing
              </button>
            </div>

            <div className="border-t border-border px-6 py-5">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-muted-foreground tracking-wide">Subtotal</span>
                <span className="text-sm text-foreground tracking-wide">€0.00</span>
              </div>
              <button
                disabled
                className="w-full py-3 bg-foreground text-background text-sm tracking-widest uppercase opacity-40 cursor-not-allowed"
              >
                Checkout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
