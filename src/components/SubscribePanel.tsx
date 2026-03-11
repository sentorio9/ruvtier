import { useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SubscribePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribePanel = ({ isOpen, onClose }: SubscribePanelProps) => {
  const [form, setForm] = useState({ email: "", title: "", firstName: "", lastName: "" });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
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
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[100] w-[85vw] sm:w-[40vw] lg:w-[25vw] bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-end h-16 md:h-20 px-6">
              <button onClick={onClose} className="luxury-button p-2" aria-label="Close">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 gap-6">
              <h3 className="font-serif font-light text-xl tracking-wider text-foreground">
                Subscribe to our newsletter
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive and discover our world, collections, and latest news.
              </p>

              {[
                { key: "email", label: "Email", type: "email" },
                { key: "title", label: "Title", type: "text" },
                { key: "firstName", label: "First Name", type: "text" },
                { key: "lastName", label: "Last Name", type: "text" },
              ].map(({ key, label, type }) => (
                <div key={key} className="border-b border-foreground/20">
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={handleChange(key)}
                    placeholder={label}
                    className="w-full bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
              ))}

              <button className="luxury-button mt-4 self-start !text-[13px]">
                Subscribe
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscribePanel;
