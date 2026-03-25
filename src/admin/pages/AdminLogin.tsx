import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { ADMIN_PREFIX } from "../config";

const fontStyle = { fontFamily: "var(--font-sans)" };

export default function AdminLogin() {
  const { login, checkStatus, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"credentials" | "waiting" | "denied">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // If already admin, redirect
  useEffect(() => {
    if (isAdmin) navigate(ADMIN_PREFIX, { replace: true });
  }, [isAdmin, navigate]);

  // Poll for approval
  useEffect(() => {
    if (step !== "waiting" || !requestId) return;

    pollRef.current = setInterval(async () => {
      try {
        const result = await checkStatus(requestId);
        if (result.status === "approved") {
          clearInterval(pollRef.current!);
          // Store remember preference
          if (rememberMe) {
            localStorage.setItem("ruvtier_admin_remember", "true");
          } else {
            localStorage.removeItem("ruvtier_admin_remember");
          }
          navigate(ADMIN_PREFIX, { replace: true });
        } else if (result.status === "denied") {
          clearInterval(pollRef.current!);
          setStep("denied");
        } else if (result.status === "expired") {
          clearInterval(pollRef.current!);
          setError("Request expired. Please try again.");
          setStep("credentials");
        }
      } catch {
        // Retry on network error
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, requestId, checkStatus, navigate, rememberMe]);

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
    } else if (result.requestId) {
      setRequestId(result.requestId);
      setStep("waiting");
    }
  };

  if (step === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,15%,8%)]">
        <div className="w-full max-w-[380px] px-6 text-center">
          <div className="mb-10">
            <h1 className="text-[18px] font-light tracking-[0.2em] text-[hsl(220,10%,75%)] uppercase" style={fontStyle}>
              Awaiting Approval
            </h1>
          </div>

          <div className="mb-8">
            <div className="w-8 h-8 border-2 border-[hsl(220,10%,25%)] border-t-[hsl(220,10%,55%)] rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[12px] text-[hsl(220,10%,45%)] leading-relaxed" style={fontStyle}>
              An approval request has been sent.
              <br />
              Waiting for authorization...
            </p>
          </div>

          <button
            onClick={() => {
              if (pollRef.current) clearInterval(pollRef.current);
              setStep("credentials");
              setRequestId(null);
            }}
            className="text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,55%)] transition-colors"
            style={fontStyle}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (step === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,15%,8%)]">
        <div className="w-full max-w-[380px] px-6 text-center">
          <h1 className="text-[18px] font-light tracking-[0.2em] text-[hsl(0,50%,55%)] uppercase mb-6" style={fontStyle}>
            Access Denied
          </h1>
          <p className="text-[12px] text-[hsl(220,10%,45%)] mb-8" style={fontStyle}>
            Your login request was denied.
          </p>
          <button
            onClick={() => { setStep("credentials"); setError(null); }}
            className="text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,55%)] transition-colors"
            style={fontStyle}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
              autoComplete="off"
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
              autoComplete="off"
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
            {loading ? "Verifying..." : "Request Access"}
          </button>
        </form>

        <p className="text-center text-[11px] text-[hsl(220,10%,30%)] mt-10" style={fontStyle}>
          Authorized personnel only · 3-step verification
        </p>
      </div>
    </div>
  );
}
