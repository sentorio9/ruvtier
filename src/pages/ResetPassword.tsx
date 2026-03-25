import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { InputField, ErrorText, SuccessText } from "@/components/client-lounge/FormElements";
import PasswordStrengthIndicator, { isPasswordValid } from "@/components/client-lounge/PasswordStrengthIndicator";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isPasswordValid(password)) {
      setError("Password does not meet all requirements");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password updated successfully. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-[380px] space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-serif text-[24px] font-light tracking-[0.12em] text-foreground">
            Ruvtier
          </h1>
          <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
            Set a new password
          </p>
        </div>

        <div className="border-t border-border" />

        {!ready ? (
          <p className="font-sans text-[12px] tracking-[0.12em] text-muted-foreground text-center">
            Verifying your reset link...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="New Password"
              value={password}
              onChange={setPassword}
              type="password"
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={password} />
            <InputField
              label="Confirm Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
              autoComplete="new-password"
            />
            {error && <ErrorText>{error}</ErrorText>}
            {success && <SuccessText>{success}</SuccessText>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans"
            >
              {submitting ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
