import { useState, type ReactNode } from "react";
import { Check, Eye, EyeOff } from "lucide-react";

export function InputField({ label, value, onChange, type = "text", autoComplete, name, showToggle }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; name?: string; showToggle?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const effectiveType = isPassword && showToggle && revealed ? "text" : type;
  return (
    <div>
      <label className="block font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={effectiveType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          name={name}
          className={`w-full h-11 ${showToggle && isPassword ? "pr-10" : ""} px-3 bg-transparent border border-border text-foreground text-[13px] font-sans focus:outline-none focus:border-foreground/40 transition-colors`}
        />
        {showToggle && isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center px-3 bg-transparent border-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {revealed ? <EyeOff size={14} strokeWidth={1} /> : <Eye size={14} strokeWidth={1} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="font-sans text-[12px] text-destructive">{children}</p>;
}

export function SuccessText({ children }: { children: ReactNode }) {
  return <p className="font-sans text-[12px] text-success">{children}</p>;
}

/**
 * LoungeCheckbox — 16px square, foreground check mark, no native styling.
 * Pairs with a label rendered alongside; the wrapper handles click + Space/Enter.
 */
export function LoungeCheckbox({ id, checked, onChange, label }: {
  id: string; checked: boolean; onChange: (v: boolean) => void; label: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        className="w-4 h-4 inline-flex items-center justify-center border border-border bg-transparent shrink-0"
      >
        {checked && <Check size={12} strokeWidth={1.25} className="text-foreground" />}
      </button>
      <label
        htmlFor={id}
        onClick={() => onChange(!checked)}
        className="font-sans text-[11px] text-muted-foreground cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
