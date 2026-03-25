import { useMemo } from "react";

const MIN_LENGTH = 12;

interface PasswordCheck {
  label: string;
  met: boolean;
}

export function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { label: `At least ${MIN_LENGTH} characters`, met: password.length >= MIN_LENGTH },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordChecks(password).every((c) => c.met);
}

export function getStrengthLevel(password: string): { label: string; percent: number; color: string } {
  const checks = getPasswordChecks(password);
  const met = checks.filter((c) => c.met).length;
  if (met <= 1) return { label: "Weak", percent: 20, color: "bg-destructive" };
  if (met <= 2) return { label: "Fair", percent: 40, color: "bg-orange-500" };
  if (met <= 3) return { label: "Good", percent: 60, color: "bg-yellow-500" };
  if (met <= 4) return { label: "Strong", percent: 80, color: "bg-emerald-500" };
  return { label: "Excellent", percent: 100, color: "bg-emerald-600" };
}

export default function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = useMemo(() => getPasswordChecks(password), [password]);
  const strength = useMemo(() => getStrengthLevel(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.color}`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
        <span className="font-sans text-[10px] tracking-[0.1em] uppercase text-muted-foreground whitespace-nowrap">
          {strength.label}
        </span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            <span className={`text-[10px] ${check.met ? "text-emerald-600" : "text-muted-foreground/50"}`}>
              {check.met ? "✓" : "○"}
            </span>
            <span
              className={`font-sans text-[10px] ${check.met ? "text-foreground/70" : "text-muted-foreground/50"}`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
