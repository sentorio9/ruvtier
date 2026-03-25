import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

type View = "login" | "register" | "profile" | "forgot";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientLoungeDrawer({ isOpen, onClose }: Props) {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMode, setEditMode] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) { setError("All fields are required"); return; }
    setSubmitting(true);
    const { error } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) setError(error);
    else resetForm();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim() || !password.trim()) { setError("All fields are required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setSubmitting(true);
    const { error } = await signUp(email.trim(), password, displayName.trim() || undefined);
    setSubmitting(false);
    if (error) setError(error);
    else {
      setSuccess("Please check your email to verify your account.");
      resetForm();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    resetForm();
    setView("login");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await updateProfile({
      display_name: editName.trim() || null,
      phone: editPhone.trim() || null,
    });
    setSubmitting(false);
    if (error) setError(error);
    else setEditMode(false);
  };

  const startEdit = () => {
    setEditName(profile?.display_name || "");
    setEditPhone(profile?.phone || "");
    setEditMode(true);
    setError(null);
  };

  const currentView = user ? "profile" : view;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-[101] h-full w-full max-w-[420px] bg-background border-l border-border transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-8 pt-8 pb-6">
            <h2 className="font-serif text-[18px] font-light tracking-[0.12em] text-foreground">
              Client Lounge
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} strokeWidth={1} />
            </button>
          </div>

          <div className="border-t border-border mx-8" />

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {loading ? (
              <p className="font-sans text-[12px] tracking-[0.12em] uppercase text-muted-foreground">
                Loading...
              </p>
            ) : currentView === "profile" ? (
              /* Profile View */
              <div className="space-y-6">
                <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                  Welcome back
                </p>
                <p className="font-serif text-[22px] font-light text-foreground">
                  {profile?.display_name || profile?.email || user?.email}
                </p>

                {!editMode ? (
                  <div className="space-y-4">
                    <div>
                      <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Email</p>
                      <p className="font-sans text-[13px] text-foreground">{profile?.email || user?.email}</p>
                    </div>
                    {profile?.phone && (
                      <div>
                        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Phone</p>
                        <p className="font-sans text-[13px] text-foreground">{profile.phone}</p>
                      </div>
                    )}

                    <div className="pt-4 space-y-3">
                      <button
                        onClick={startEdit}
                        className="w-full h-11 border border-border text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-accent transition-colors font-sans"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="w-full h-11 text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-sans"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    <InputField label="Display Name" value={editName} onChange={setEditName} />
                    <InputField label="Phone" value={editPhone} onChange={setEditPhone} type="tel" />
                    {error && <ErrorText>{error}</ErrorText>}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="flex-1 h-11 border border-border text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-sans"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans"
                      >
                        {submitting ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : currentView === "register" ? (
              /* Register View */
              <div className="space-y-6">
                <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                  Create an account
                </p>
                <form onSubmit={handleRegister} className="space-y-5">
                  <InputField label="Full Name" value={displayName} onChange={setDisplayName} autoComplete="name" />
                  <InputField label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
                  <InputField label="Password" value={password} onChange={setPassword} type="password" autoComplete="new-password" />
                  {error && <ErrorText>{error}</ErrorText>}
                  {success && <SuccessText>{success}</SuccessText>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans"
                  >
                    {submitting ? "Creating Account..." : "Register"}
                  </button>
                </form>
                <p className="font-sans text-[11px] text-muted-foreground text-center">
                  Already have an account?{" "}
                  <button onClick={() => { resetForm(); setView("login"); }} className="underline text-foreground hover:text-foreground/80">
                    Sign in
                  </button>
                </p>
              </div>
            ) : (
              /* Login View */
              <div className="space-y-6">
                <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">
                  Sign in to your account
                </p>
                <form onSubmit={handleLogin} className="space-y-5">
                  <InputField label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
                  <InputField label="Password" value={password} onChange={setPassword} type="password" autoComplete="current-password" />
                  {error && <ErrorText>{error}</ErrorText>}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans"
                  >
                    {submitting ? "Signing In..." : "Sign In"}
                  </button>
                </form>
                <p className="font-sans text-[11px] text-muted-foreground text-center">
                  New to Ruvtier?{" "}
                  <button onClick={() => { resetForm(); setView("register"); }} className="underline text-foreground hover:text-foreground/80">
                    Create an account
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="border-t border-border pt-6">
              <p className="font-sans text-[10px] tracking-[0.1em] text-muted-foreground/60 text-center">
                Your privacy is sacred to us
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InputField({ label, value, onChange, type = "text", autoComplete }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string;
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
        className="w-full h-11 px-3 bg-transparent border border-border text-foreground text-[13px] font-sans focus:outline-none focus:border-foreground/40 transition-colors"
      />
    </div>
  );
}

function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[12px] text-destructive">{children}</p>;
}

function SuccessText({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[12px] text-green-700">{children}</p>;
}
