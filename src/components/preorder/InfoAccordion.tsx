/**
 * InfoAccordion — minimal collapsible row used on PreorderPage for
 * Composition & care / Fit & measurements / Provenance & maker.
 *
 * A hairline top border, label in the page's eyebrow register, and
 * a plain "+" / "−" toggle on the right. Empty sections are filtered
 * out by the parent before render.
 */
import { useState, type ReactNode } from "react";

interface Props {
  label: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const InfoAccordion = ({ label, children, defaultOpen = false }: Props) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left transition-colors duration-300 hover:text-foreground/70"
      >
        <span className="text-xs tracking-[0.18em] uppercase text-foreground/90">
          {label}
        </span>
        <span className="text-base font-light text-foreground/70 leading-none">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="pb-6 text-sm text-muted-foreground tracking-wide leading-relaxed space-y-3">
          {children}
        </div>
      )}
    </div>
  );
};

export default InfoAccordion;
