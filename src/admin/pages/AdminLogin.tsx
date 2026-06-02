import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { ADMIN_PREFIX } from "../config";

const fontStyle = { fontFamily: "var(--font-sans)" };

export default function AdminLogin() {
  const { login, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) navigate(ADMIN_PREFIX, { replace: true });
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    const result = await login(username.trim(), password, rememberMe);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.authenticated) {
      navigate(ADMIN_PREFIX, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(220,15%,8%)]">
      <div className="w-full max-w-[380px] px-6">
        <div className="text-center mb-10">
          <h1 className="text-[18px] font-light tracking-[0.2em] text-[hsl(220,10%,75%)] uppercase" style={fontStyle}>
            Internal Access
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-[hsl(220,10%,50%)] mb-2" style={fontStyle}>
              Operator ID
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full h-11 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,20%)] text-[hsl(220,10%,85%)] text-sm focus:outline-none focus:border-[hsl(220,10%,35%)] transition-colors"
              style={fontStyle}
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.15em] uppercase text-[hsl(220,10%,50%)] mb-2" style={fontStyle}>
              Access Key
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-11 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,20%)] text-[hsl(220,10%,85%)] text-sm focus:outline-none focus:border-[hsl(220,10%,35%)] transition-colors"
              style={fontStyle}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,25%)] accent-[hsl(220,10%,55%)]"
            />
            <span className="text-[11px] tracking-[0.1em] text-[hsl(220,10%,40%)]" style={fontStyle}>
              Remember this device
            </span>
          </label>

          {error && (
            <p className="text-[12px] text-[hsl(0,60%,55%)]" style={fontStyle}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[12px] tracking-[0.15em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>

        <p className="text-center text-[11px] text-[hsl(220,10%,30%)] mt-10" style={fontStyle}>
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}
