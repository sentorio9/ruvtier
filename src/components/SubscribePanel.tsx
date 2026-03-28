import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface SubscribePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscribePanel = ({ isOpen, onClose }: SubscribePanelProps) => {
  useBodyScrollLock(isOpen);
  const [form, setForm] = useState({ email: "", firstName: "", lastName: "" });

  // Escape key dismiss
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent("Newsletter Subscription");
    const body = encodeURIComponent(`New subscriber:\n\nEmail: ${form.email}\nFirst Name: ${form.firstName}\nLast Name: ${form.lastName}`);
    window.open(`mailto:theruvtier@gmail.com?subject=${subject}&body=${body}`, "_self");
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
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
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-[100] w-[85vw] sm:w-[40vw] lg:w-[25vw] bg-background border-r border-border flex flex-col"
          >
            <div className="flex items-center justify-end h-16 md:h-20 px-6">
              <button onClick={handleClose} className="luxury-button p-2" aria-label="Close">
                <X size={18} strokeWidth={1} />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 gap-6">
              {submitted ? (
                <div className="flex flex-col gap-4">
                  <h3 className="font-serif font-light text-xl tracking-wider text-foreground">
                    Thank you
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Thank you for subscribing to Ruvtier.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-serif font-light text-xl tracking-wider text-foreground">
                    Subscribe to our newsletter
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Receive and discover our world, collections, and latest news.
                  </p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {[
                      { key: "email", label: "Email", type: "email" },
                      { key: "firstName", label: "First Name", type: "text" },
                      { key: "lastName", label: "Last Name", type: "text" },
                    ].map(({ key, label, type }) => (
                      <div key={key} className="border-b border-foreground/20">
                        <input
                          type={type}
                          required={key === "email"}
                          value={form[key as keyof typeof form]}
                          onChange={handleChange(key)}
                        placeholder={label}
                        aria-label={label}
                        className="w-full bg-transparent py-3 font-sans text-sm tracking-wide placeholder:text-muted-foreground/50 focus:outline-none"
                        />
                      </div>
                    ))}

                    <button type="submit" className="luxury-button mt-4 self-start !text-[13px]">
                      Subscribe
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubscribePanel;
