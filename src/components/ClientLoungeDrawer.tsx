import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";
import { InputField, ErrorText, SuccessText } from "./client-lounge/FormElements";
import PasswordStrengthIndicator, { isPasswordValid } from "./client-lounge/PasswordStrengthIndicator";
import AddressFields, { type AddressData } from "./client-lounge/AddressFields";

type View = "login" | "register" | "profile" | "forgot";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const emptyAddress: AddressData = {
  street_address: "",
  street_address_2: "",
  city: "",
  state_province: "",
  zip_code: "",
  country: "",
};

export default function ClientLoungeDrawer({ isOpen, onClose }: Props) {
  const { user, profile, loading, signIn, signUp, signOut, resetPassword, updateProfile } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Profile edit state
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<AddressData>(emptyAddress);
  const [billingAddress, setBillingAddress] = useState<AddressData>(emptyAddress);
  const [useShippingAsBilling, setUseShippingAsBilling] = useState(true);

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
    const { error } = await signIn(email.trim(), password, rememberMe);
    setSubmitting(false);
    if (error) setError(error);
    else resetForm();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim() || !password.trim()) { setError("All fields are required"); return; }
    if (!isPasswordValid(password)) { setError("Password does not meet all requirements"); return; }
    setSubmitting(true);
    const { error } = await signUp(email.trim(), password, displayName.trim() || undefined);
    setSubmitting(false);
    if (error) setError(error);
    else {
      setSuccess(`Verification email sent to ${email.trim()}. Please check your inbox to activate your account.`);
      resetForm();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    resetForm();
    setView("login");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) { setError("Please enter your email address"); return; }
    setSubmitting(true);
    const { error } = await resetPassword(email.trim());
    setSubmitting(false);
    if (error) setError(error);
    else setSuccess(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const updates: Record<string, unknown> = {
      display_name: editName.trim() || null,
      phone: editPhone.trim() || null,
      street_address: shippingAddress.street_address || null,
      street_address_2: shippingAddress.street_address_2 || null,
      city: shippingAddress.city || null,
      state_province: shippingAddress.state_province || null,
      zip_code: shippingAddress.zip_code || null,
      country: shippingAddress.country || null,
      use_shipping_as_billing: useShippingAsBilling,
    };
    if (!useShippingAsBilling) {
      updates.billing_street_address = billingAddress.street_address || null;
      updates.billing_street_address_2 = billingAddress.street_address_2 || null;
      updates.billing_city = billingAddress.city || null;
      updates.billing_state_province = billingAddress.state_province || null;
      updates.billing_zip_code = billingAddress.zip_code || null;
      updates.billing_country = billingAddress.country || null;
    }
    const { error } = await updateProfile(updates as any);
    setSubmitting(false);
    if (error) setError(error);
    else setEditMode(false);
  };

  const startEdit = () => {
    setEditName(profile?.display_name || "");
    setEditPhone(profile?.phone || "");
    setShippingAddress({
      street_address: (profile as any)?.street_address || "",
      street_address_2: (profile as any)?.street_address_2 || "",
      city: (profile as any)?.city || "",
      state_province: (profile as any)?.state_province || "",
      zip_code: (profile as any)?.zip_code || "",
      country: (profile as any)?.country || "",
    });
    setBillingAddress({
      street_address: (profile as any)?.billing_street_address || "",
      street_address_2: (profile as any)?.billing_street_address_2 || "",
      city: (profile as any)?.billing_city || "",
      state_province: (profile as any)?.billing_state_province || "",
      zip_code: (profile as any)?.billing_zip_code || "",
      country: (profile as any)?.billing_country || "",
    });
    setUseShippingAsBilling((profile as any)?.use_shipping_as_billing ?? true);
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
              <p className="font-sans text-[12px] tracking-[0.12em] uppercase text-muted-foreground">Loading...</p>
            ) : currentView === "profile" ? (
              <ProfileView
                user={user}
                profile={profile}
                editMode={editMode}
                editName={editName}
                editPhone={editPhone}
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
                useShippingAsBilling={useShippingAsBilling}
                error={error}
                submitting={submitting}
                onEditName={setEditName}
                onEditPhone={setEditPhone}
                onShippingChange={(f, v) => setShippingAddress((p) => ({ ...p, [f]: v }))}
                onBillingChange={(f, v) => setBillingAddress((p) => ({ ...p, [f]: v }))}
                onToggleBilling={setUseShippingAsBilling}
                onStartEdit={startEdit}
                onCancelEdit={() => setEditMode(false)}
                onSave={handleUpdateProfile}
                onSignOut={handleSignOut}
              />
            ) : currentView === "register" ? (
              <RegisterView
                email={email}
                password={password}
                displayName={displayName}
                error={error}
                success={success}
                submitting={submitting}
                onEmail={setEmail}
                onPassword={setPassword}
                onDisplayName={setDisplayName}
                onSubmit={handleRegister}
                onSwitchToLogin={() => { resetForm(); setView("login"); }}
              />
            ) : currentView === "forgot" ? (
              <ForgotPasswordView
                email={email}
                error={error}
                success={success}
                submitting={submitting}
                onEmail={setEmail}
                onSubmit={handleForgotPassword}
                onSwitchToLogin={() => { resetForm(); setView("login"); }}
              />
            ) : (
              <LoginView
                email={email}
                password={password}
                rememberMe={rememberMe}
                error={error}
                submitting={submitting}
                onEmail={setEmail}
                onPassword={setPassword}
                onRememberMe={setRememberMe}
                onSubmit={handleLogin}
                onSwitchToRegister={() => { resetForm(); setView("register"); }}
                onSwitchToForgot={() => { resetForm(); setView("forgot"); }}
              />
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

/* ─── Login View ─── */
function LoginView({ email, password, rememberMe, error, submitting, onEmail, onPassword, onRememberMe, onSubmit, onSwitchToRegister, onSwitchToForgot }: {
  email: string; password: string; rememberMe: boolean; error: string | null; submitting: boolean;
  onEmail: (v: string) => void; onPassword: (v: string) => void; onRememberMe: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void; onSwitchToRegister: () => void; onSwitchToForgot: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Sign in to your account</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <InputField label="Email" value={email} onChange={onEmail} type="email" autoComplete="email" />
        <InputField label="Password" value={password} onChange={onPassword} type="password" autoComplete="current-password" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => onRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 accent-foreground"
            />
            <label htmlFor="remember-me" className="font-sans text-[11px] text-muted-foreground cursor-pointer">
              Keep me signed in
            </label>
          </div>
          <button type="button" onClick={onSwitchToForgot} className="font-sans text-[11px] text-muted-foreground hover:text-foreground underline transition-colors">
            Forgot password?
          </button>
        </div>

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
        <button onClick={onSwitchToRegister} className="underline text-foreground hover:text-foreground/80">
          Create an account
        </button>
      </p>
    </div>
  );
}

/* ─── Register View ─── */
function RegisterView({ email, password, displayName, error, success, submitting, onEmail, onPassword, onDisplayName, onSubmit, onSwitchToLogin }: {
  email: string; password: string; displayName: string; error: string | null; success: string | null; submitting: boolean;
  onEmail: (v: string) => void; onPassword: (v: string) => void; onDisplayName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void; onSwitchToLogin: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Create an account</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <InputField label="Full Name" value={displayName} onChange={onDisplayName} autoComplete="name" />
        <InputField label="Email" value={email} onChange={onEmail} type="email" autoComplete="email" />
        <InputField label="Password" value={password} onChange={onPassword} type="password" autoComplete="new-password" />

        <PasswordStrengthIndicator password={password} />

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
        <button onClick={onSwitchToLogin} className="underline text-foreground hover:text-foreground/80">
          Sign in
        </button>
      </p>
    </div>
  );
}

/* ─── Forgot Password View ─── */
function ForgotPasswordView({ email, error, success, submitting, onEmail, onSubmit, onSwitchToLogin }: {
  email: string; error: string | null; success: string | null; submitting: boolean;
  onEmail: (v: string) => void; onSubmit: (e: React.FormEvent) => void; onSwitchToLogin: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Reset your password</p>
      <p className="font-sans text-[12px] text-muted-foreground leading-relaxed">
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        <InputField label="Email" value={email} onChange={onEmail} type="email" autoComplete="email" />
        {error && <ErrorText>{error}</ErrorText>}
        {success && <SuccessText>{success}</SuccessText>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans"
        >
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className="font-sans text-[11px] text-muted-foreground text-center">
        <button onClick={onSwitchToLogin} className="underline text-foreground hover:text-foreground/80">
          Back to sign in
        </button>
      </p>
    </div>
  );
}

/* ─── Profile View ─── */
function ProfileView({ user, profile, editMode, editName, editPhone, shippingAddress, billingAddress, useShippingAsBilling, error, submitting, onEditName, onEditPhone, onShippingChange, onBillingChange, onToggleBilling, onStartEdit, onCancelEdit, onSave, onSignOut }: {
  user: any; profile: any; editMode: boolean;
  editName: string; editPhone: string;
  shippingAddress: AddressData; billingAddress: AddressData; useShippingAsBilling: boolean;
  error: string | null; submitting: boolean;
  onEditName: (v: string) => void; onEditPhone: (v: string) => void;
  onShippingChange: (f: keyof AddressData, v: string) => void;
  onBillingChange: (f: keyof AddressData, v: string) => void;
  onToggleBilling: (v: boolean) => void;
  onStartEdit: () => void; onCancelEdit: () => void;
  onSave: (e: React.FormEvent) => void; onSignOut: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Welcome back</p>
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
          {profile?.city && (
            <div>
              <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">Location</p>
              <p className="font-sans text-[13px] text-foreground">
                {[profile.city, profile.state_province, profile.country].filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <button onClick={onStartEdit} className="w-full h-11 border border-border text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-accent transition-colors font-sans">
              Edit Profile
            </button>
            <button onClick={onSignOut} className="w-full h-11 text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-sans">
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={onSave} className="space-y-5">
          <InputField label="Display Name" value={editName} onChange={onEditName} />
          <InputField label="Phone" value={editPhone} onChange={onEditPhone} type="tel" />

          <div className="border-t border-border pt-5">
            <AddressFields
              shippingAddress={shippingAddress}
              billingAddress={billingAddress}
              useShippingAsBilling={useShippingAsBilling}
              onShippingChange={onShippingChange}
              onBillingChange={onBillingChange}
              onToggleBilling={onToggleBilling}
            />
          </div>

          {error && <ErrorText>{error}</ErrorText>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancelEdit} className="flex-1 h-11 border border-border text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-sans">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="flex-1 h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans">
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
