/**
 * ScrollFadeIn — viewport-triggered fade-and-rise. The house's only
 * scroll-in motion; used to bring every editorial block in calmly.
 *
 * Spec: fade + 16px rise over 800ms ease-out, fires once at ~15%
 * viewport. Children stagger via `delay` (typically `i * 0.1`).
 * Honours prefers-reduced-motion (instant, no transform).
 */
import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollFadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const luxuryEase = [0.22, 0.61, 0.36, 1] as const;

const ScrollFadeIn = ({ children, className = "", delay = 0 }: ScrollFadeInProps) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, delay, ease: luxuryEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollFadeIn;
