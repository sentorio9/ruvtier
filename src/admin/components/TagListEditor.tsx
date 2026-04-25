import { useState } from "react";
import { X, Plus } from "lucide-react";

interface TagListEditorProps {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export default function TagListEditor({ label, value, onChange, placeholder, suggestions }: TagListEditorProps) {
  const [draft, setDraft] = useState("");
  const fontStyle = { fontFamily: "var(--font-sans)" };
  const labelClass = "block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5";

  const add = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) return;
    onChange([...value, t]);
    setDraft("");
  };

  return (
    <div>
      <label className={labelClass} style={fontStyle}>{label}</label>

      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {value.length === 0 && (
          <span className="text-[11px] text-[hsl(220,10%,30%)] italic" style={fontStyle}>None added</span>
        )}
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 h-7 px-2 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,18%)] text-[11px] text-[hsl(220,10%,75%)]"
            style={fontStyle}
          >
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== t))}
              className="text-[hsl(220,10%,40%)] hover:text-[hsl(0,55%,60%)]"
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={placeholder || "Add and press Enter"}
          className="flex-1 h-9 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
          style={fontStyle}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          className="h-9 px-3 bg-[hsl(220,15%,14%)] border border-[hsl(220,10%,18%)] text-[hsl(220,10%,70%)] text-[11px] tracking-[0.08em] uppercase hover:bg-[hsl(220,15%,18%)]"
          style={fontStyle}
        >
          <Plus size={12} />
        </button>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="text-[10px] tracking-[0.08em] uppercase text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,65%)] px-1.5 py-0.5 border border-[hsl(220,10%,15%)]"
                style={fontStyle}
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
