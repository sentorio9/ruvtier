import type { ReactNode } from "react";

export function InputField({ label, value, onChange, type = "text", autoComplete, name }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string; name?: string;
}) {
  return (
    <div>
      <label className="block font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        name={name}
        className="w-full h-11 px-3 bg-transparent border border-border text-foreground text-[13px] font-sans focus:outline-none focus:border-foreground/40 transition-colors"
      />
    </div>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return <p className="font-sans text-[12px] text-destructive">{children}</p>;
}

export function SuccessText({ children }: { children: ReactNode }) {
  return <p className="font-sans text-[12px] text-success">{children}</p>;
}
