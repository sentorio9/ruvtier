/**
 * SearchOverlay — full-screen overlay with a single input and a
 * debounced real-time Supabase query. Selecting a result navigates
 * to the product page.
 *
 * Props:
 *   - `isOpen: boolean` · `onClose(): void`
 *
 * Used by: `Navigation.tsx`, `FullScreenMenu.tsx`.
 *
 * Design-system dependencies: page canvas `bg-background`, hairline
 * input, 0.6-stroke search icon. Escape closes; body scroll locks;
 * focus restores to trigger on close.
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayTransition = { duration: 0.35, ease: "easeOut" as const };

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  useBodyScrollLock(isOpen);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string; slug: string; thumbnail_url: string | null }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  // Capture the element that opened the overlay so focus can return there on close.
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = (document.activeElement as HTMLElement) ?? null;
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
    } else if (triggerRef.current) {
      // Restore focus to the trigger when the overlay closes.
      triggerRef.current.focus?.();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("name, slug, thumbnail_url")
        .eq("status", "active")
        .is("deleted_at", null)
        .ilike("name", `%${query}%`)
        .limit(6);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
          className="fixed inset-0 z-[110] bg-background/95 backdrop-blur-sm flex flex-col items-center pt-[20vh]"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="w-full max-w-lg px-6" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-foreground/20 pb-2 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-muted-foreground shrink-0" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" />
                <line x1="11" y1="11" x2="15" y2="15" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="w-full bg-transparent font-serif text-lg tracking-[0.05em] text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs tracking-[0.1em] uppercase" aria-label="Close search">
                Close
              </button>
            </div>

            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 flex flex-col gap-4"
              >
                {results.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => { navigate(`/product/${item.slug}`); onClose(); }}
                    className="flex items-center gap-4 text-left hover:opacity-70 transition-opacity"
                  >
                    {item.thumbnail_url && (
                      <img src={item.thumbnail_url} alt="" className="w-12 h-12 object-cover" loading="lazy" />
                    )}
                    <span className="font-serif text-sm tracking-[0.08em] text-foreground">{item.name}</span>
                  </button>
                ))}
              </motion.div>
            )}

            {query.trim() && results.length === 0 && (
              <p className="mt-6 text-muted-foreground text-xs tracking-[0.1em] uppercase text-center">No results found</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
