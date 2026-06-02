import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useClientLoungeAccount, type ClientLoungeCart, type ClientLoungeOrder } from "@/hooks/useClientLoungeAccount";
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

const formatMoney = (amount: number | null | undefined) => {
  const value = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "Pending";
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return "Pending";
  }
};

export default function ClientLoungeDrawer({ isOpen, onClose }: Props) {
  const { user, profile, loading, signIn, signUp, signOut, resetPassword, updateProfile } = useAuth();
  const account = useClientLoungeAccount();
  useBodyScrollLock(isOpen);

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    const result = await signIn(email.trim(), password, rememberMe);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else resetForm();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }
    if (!isPasswordValid(password)) {
      setError("Password does not meet all requirements");
      return;
    }

    setSubmitting(true);
    const result = await signUp(email.trim(), password, displayName.trim() || undefined);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else {
      const destination = email.trim();
      resetForm();
      setSuccess(`Verification email sent to ${destination}. Please check your inbox to activate your account.`);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(email.trim());
    setSubmitting(false);
    if (result.error) setError(result.error);
    else setSuccess(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
  };

  const handleSignOut = async () => {
    await signOut();
    resetForm();
    setEditMode(false);
    setView("login");
  };

  const startEdit = () => {
    setEditName(profile?.display_name || "");
    setEditPhone(profile?.phone || "");
    setShippingAddress({
      street_address: profile?.street_address || "",
      street_address_2: profile?.street_address_2 || "",
      city: profile?.city || "",
      state_province: profile?.state_province || "",
      zip_code: profile?.zip_code || "",
      country: profile?.country || "",
    });
    setBillingAddress({
      street_address: profile?.billing_street_address || "",
      street_address_2: profile?.billing_street_address_2 || "",
      city: profile?.billing_city || "",
      state_province: profile?.billing_state_province || "",
      zip_code: profile?.billing_zip_code || "",
      country: profile?.billing_country || "",
    });
    setUseShippingAsBilling(profile?.use_shipping_as_billing ?? true);
    setEditMode(true);
    setError(null);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const updates: Record<string, unknown> = {
      display_name: editName,
      phone: editPhone,
      street_address: shippingAddress.street_address,
      street_address_2: shippingAddress.street_address_2,
      city: shippingAddress.city,
      state_province: shippingAddress.state_province,
      zip_code: shippingAddress.zip_code,
      country: shippingAddress.country,
      use_shipping_as_billing: useShippingAsBilling,
      billing_street_address: useShippingAsBilling ? shippingAddress.street_address : billingAddress.street_address,
      billing_street_address_2: useShippingAsBilling ? shippingAddress.street_address_2 : billingAddress.street_address_2,
      billing_city: useShippingAsBilling ? shippingAddress.city : billingAddress.city,
      billing_state_province: useShippingAsBilling ? shippingAddress.state_province : billingAddress.state_province,
      billing_zip_code: useShippingAsBilling ? shippingAddress.zip_code : billingAddress.zip_code,
      billing_country: useShippingAsBilling ? shippingAddress.country : billingAddress.country,
    };

    const result = await updateProfile(updates);
    setSubmitting(false);
    if (result.error) setError(result.error);
    else setEditMode(false);
  };

  const switchView = (next: View) => {
    resetForm();
    setView(next);
  };

  const currentView = user ? "profile" : view;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 z-[101] h-full w-full max-w-[420px] bg-background border-l border-border"
            role="dialog"
            aria-label="Client Lounge"
            aria-modal="true"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-8 pt-8 pb-6">
                <h2 className="font-serif text-[18px] font-light tracking-[0.12em] text-foreground">
                  Client Lounge
                </h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close client lounge">
                  <X size={18} strokeWidth={1} />
                </button>
              </div>

              <div className="border-t border-border mx-8" />

              <div className="flex-1 overflow-y-auto px-8 py-8">
                {loading ? (
                  <p className="font-sans text-[12px] tracking-[0.12em] uppercase text-muted-foreground">Loading...</p>
                ) : currentView === "profile" ? (
                  <ProfileView
                    userEmail={user?.email ?? null}
                    profile={profile}
                    editMode={editMode}
                    editName={editName}
                    editPhone={editPhone}
                    shippingAddress={shippingAddress}
                    billingAddress={billingAddress}
                    useShippingAsBilling={useShippingAsBilling}
                    error={error}
                    submitting={submitting}
                    orders={account.orders}
                    carts={account.carts}
                    accountLoading={account.loading}
                    accountError={account.error}
                    onEditName={setEditName}
                    onEditPhone={setEditPhone}
                    onShippingChange={(field, value) => setShippingAddress((prev) => ({ ...prev, [field]: value }))}
                    onBillingChange={(field, value) => setBillingAddress((prev) => ({ ...prev, [field]: value }))}
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
                    onSwitchToLogin={() => switchView("login")}
                  />
                ) : currentView === "forgot" ? (
                  <ForgotPasswordView
                    email={email}
                    error={error}
                    success={success}
                    submitting={submitting}
                    onEmail={setEmail}
                    onSubmit={handleForgotPassword}
                    onSwitchToLogin={() => switchView("login")}
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
                    onSwitchToRegister={() => switchView("register")}
                    onSwitchToForgot={() => switchView("forgot")}
                  />
                )}
              </div>

              <div className="px-8 pb-8">
                <div className="border-t border-border pt-6">
                  <p className="font-sans text-[10px] tracking-[0.1em] text-muted-foreground/60 text-center">
                    Your privacy is sacred to us
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function LoginView({ email, password, rememberMe, error, submitting, onEmail, onPassword, onRememberMe, onSubmit, onSwitchToRegister, onSwitchToForgot }: {
  email: string;
  password: string;
  rememberMe: boolean;
  error: string | null;
  submitting: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onRememberMe: (value: boolean) => void;
  onSubmit: (event: React.FormEvent) => void;
  onSwitchToRegister: () => void;
  onSwitchToForgot: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Sign in to your account</p>
      <form onSubmit={onSubmit} className="space-y-5">
        <InputField label="Email" value={email} onChange={onEmail} type="email" autoComplete="email" />
        <InputField label="Password" value={password} onChange={onPassword} type="password" autoComplete="current-password" />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={rememberMe} onChange={(event) => onRememberMe(event.target.checked)} className="w-3.5 h-3.5 accent-foreground" />
            <span className="font-sans text-[11px] text-muted-foreground">Keep me signed in</span>
          </label>
          <button type="button" onClick={onSwitchToForgot} className="font-sans text-[11px] text-muted-foreground hover:text-foreground underline transition-colors">
            Forgot password?
          </button>
        </div>

        {error && <ErrorText>{error}</ErrorText>}
        <button type="submit" disabled={submitting} className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans">
          {submitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p className="font-sans text-[11px] text-muted-foreground text-center">
        New to Ruvtier? <button onClick={onSwitchToRegister} className="underline text-foreground hover:text-foreground/80">Create an account</button>
      </p>
    </div>
  );
}

function RegisterView({ email, password, displayName, error, success, submitting, onEmail, onPassword, onDisplayName, onSubmit, onSwitchToLogin }: {
  email: string;
  password: string;
  displayName: string;
  error: string | null;
  success: string | null;
  submitting: boolean;
  onEmail: (value: string) => void;
  onPassword: (value: string) => void;
  onDisplayName: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onSwitchToLogin: () => void;
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
        <button type="submit" disabled={submitting} className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans">
          {submitting ? "Creating Account..." : "Register"}
        </button>
      </form>
      <p className="font-sans text-[11px] text-muted-foreground text-center">
        Already have an account? <button onClick={onSwitchToLogin} className="underline text-foreground hover:text-foreground/80">Sign in</button>
      </p>
    </div>
  );
}

function ForgotPasswordView({ email, error, success, submitting, onEmail, onSubmit, onSwitchToLogin }: {
  email: string;
  error: string | null;
  success: string | null;
  submitting: boolean;
  onEmail: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onSwitchToLogin: () => void;
}) {
  return (
    <div className="space-y-6">
      <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Reset your password</p>
      <p className="font-sans text-[12px] text-muted-foreground leading-relaxed">
        Enter the email address associated with your account and we will send a password reset link.
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        <InputField label="Email" value={email} onChange={onEmail} type="email" autoComplete="email" />
        {error && <ErrorText>{error}</ErrorText>}
        {success && <SuccessText>{success}</SuccessText>}
        <button type="submit" disabled={submitting} className="w-full h-11 bg-foreground text-background text-[11px] tracking-[0.15em] uppercase hover:bg-foreground/90 transition-colors disabled:opacity-40 font-sans">
          {submitting ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      <p className="font-sans text-[11px] text-muted-foreground text-center">
        <button onClick={onSwitchToLogin} className="underline text-foreground hover:text-foreground/80">Back to sign in</button>
      </p>
    </div>
  );
}

function ProfileView({
  userEmail,
  profile,
  editMode,
  editName,
  editPhone,
  shippingAddress,
  billingAddress,
  useShippingAsBilling,
  error,
  submitting,
  orders,
  carts,
  accountLoading,
  accountError,
  onEditName,
  onEditPhone,
  onShippingChange,
  onBillingChange,
  onToggleBilling,
  onStartEdit,
  onCancelEdit,
  onSave,
  onSignOut,
}: {
  userEmail: string | null;
  profile: any;
  editMode: boolean;
  editName: string;
  editPhone: string;
  shippingAddress: AddressData;
  billingAddress: AddressData;
  useShippingAsBilling: boolean;
  error: string | null;
  submitting: boolean;
  orders: ClientLoungeOrder[];
  carts: ClientLoungeCart[];
  accountLoading: boolean;
  accountError: string | null;
  onEditName: (value: string) => void;
  onEditPhone: (value: string) => void;
  onShippingChange: (field: keyof AddressData, value: string) => void;
  onBillingChange: (field: keyof AddressData, value: string) => void;
  onToggleBilling: (value: boolean) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (event: React.FormEvent) => void;
  onSignOut: () => void;
}) {
  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground">Welcome back</p>
        <p className="font-serif text-[22px] font-light text-foreground break-words">
          {profile?.display_name || profile?.email || userEmail}
        </p>
      </div>

      {!editMode ? (
        <div className="space-y-5">
          <ProfileField label="Email" value={profile?.email || userEmail} />
          {profile?.phone && <ProfileField label="Phone" value={profile.phone} />}
          {(profile?.city || profile?.country) && (
            <ProfileField label="Location" value={[profile?.city, profile?.state_province, profile?.country].filter(Boolean).join(", ")} />
          )}

          <AccountActivity orders={orders} carts={carts} loading={accountLoading} error={accountError} />

          <div className="pt-2 space-y-3">
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

function ProfileField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">{label}</p>
      <p className="font-sans text-[13px] text-foreground break-words">{value}</p>
    </div>
  );
}

function AccountActivity({ orders, carts, loading, error }: { orders: ClientLoungeOrder[]; carts: ClientLoungeCart[]; loading: boolean; error: string | null }) {
  const activeCart = carts.find((cart) => cart.status === "active") ?? carts[0];

  return (
    <div className="border-t border-border pt-5 space-y-5">
      <div>
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Orders</p>
        {loading ? (
          <p className="font-sans text-[12px] text-muted-foreground">Loading account activity...</p>
        ) : error ? (
          <p className="font-sans text-[12px] text-destructive">Unable to load account activity.</p>
        ) : orders.length === 0 ? (
          <p className="font-sans text-[12px] text-muted-foreground">No orders are linked to this account yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="border border-border px-3 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-sans text-[12px] text-foreground tracking-[0.06em]">{order.order_number}</p>
                    <p className="font-sans text-[11px] text-muted-foreground mt-1">Placed {formatDate(order.created_at)}</p>
                  </div>
                  <p className="font-sans text-[11px] text-foreground uppercase tracking-[0.1em]">{order.status}</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-sans text-[11px] text-muted-foreground">Payment {order.payment_status || "pending"}</p>
                  <p className="font-sans text-[12px] text-foreground">{formatMoney(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3">Current Cart</p>
        {!activeCart ? (
          <p className="font-sans text-[12px] text-muted-foreground">No active cart is linked to this account.</p>
        ) : (
          <div className="border border-border px-3 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-sans text-[12px] text-foreground">{activeCart.item_count} item{activeCart.item_count === 1 ? "" : "s"}</p>
              <p className="font-sans text-[11px] text-muted-foreground mt-1">Updated {formatDate(activeCart.updated_at)}</p>
            </div>
            <p className="font-sans text-[12px] text-foreground">{formatMoney(activeCart.subtotal)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
