/**
 * ScrollFadeIn — viewport-triggered fade-and-rise. The house's only
 * scroll-in motion; used to bring every editorial block in calmly.
 *
 * Props:
 *   - `children: ReactNode`
 *   - `className?: string`
 *   - `delay?: number` — seconds; stagger sibling blocks gently.
 *
 * Used by: most public pages.
 *
 * Design-system dependencies: single easing curve
 * `cubic-bezier(0.22,0.61,0.36,1)`, 900ms duration, 24px rise. Fires
 * once via `viewport={{ once: true }}`.
 */
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const luxuryEase = [0.22, 0.61, 0.36, 1] as const;

const ScrollFadeIn = ({ children, className = "", delay = 0 }: ScrollFadeInProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.9, delay, ease: luxuryEase }}
    className={className}
  >
    {children}
  </motion.div>
);

export default ScrollFadeIn;
