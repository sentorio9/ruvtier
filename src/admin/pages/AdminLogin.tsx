import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { ADMIN_PREFIX } from "../config";

const PASSWORD_POLICY = {
  minLength: 14,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSpecial: true,
};

function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_POLICY.minLength) return `Minimum ${PASSWORD_POLICY.minLength} characters required`;
  if (PASSWORD_POLICY.requireUpper && !/[A-Z]/.test(pw)) return "Must include an uppercase letter";
  if (PASSWORD_POLICY.requireLower && !/[a-z]/.test(pw)) return "Must include a lowercase letter";
  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(pw)) return "Must include a number";
  if (PASSWORD_POLICY.requireSpecial && !/[^A-Za-z0-9]/.test(pw)) return "Must include a special character";
  return null;
}

export default function AdminLogin() {
  const { signIn } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      navigate(ADMIN_PREFIX);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,15%,8%)]">
      <div className="w-full max-w-[380px] px-6">
        <div className="text-center mb-10">
          <h1
            className="text-[18px] font-light tracking-[0.2em] text-[hsl(220,10%,75%)] uppercase"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Internal Access
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-[hsl(220,10%,50%)] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full h-11 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,20%)] text-[hsl(220,10%,85%)] text-sm focus:outline-none focus:border-[hsl(220,10%,35%)] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-[hsl(220,10%,50%)] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-11 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,20%)] text-[hsl(220,10%,85%)] text-sm focus:outline-none focus:border-[hsl(220,10%,35%)] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            />
          </div>

          {error && (
            <p className="text-[12px] text-[hsl(0,60%,55%)]" style={{ fontFamily: "var(--font-sans)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[12px] tracking-[0.15em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[11px] text-[hsl(220,10%,30%)] mt-10" style={{ fontFamily: "var(--font-sans)" }}>
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
