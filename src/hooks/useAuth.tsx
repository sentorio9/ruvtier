import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { isSupabaseConfigured, supabase, SUPABASE_CONFIG_ERROR } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  street_address: string | null;
  street_address_2: string | null;
  city: string | null;
  state_province: string | null;
  zip_code: string | null;
  country: string | null;
  billing_street_address: string | null;
  billing_street_address_2: string | null;
  billing_city: string | null;
  billing_state_province: string | null;
  billing_zip_code: string | null;
  billing_country: string | null;
  use_shipping_as_billing: boolean | null;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Record<string, unknown>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthState | null>(null);

const unavailable = () => ({ error: SUPABASE_CONFIG_ERROR });

const PROFILE_FIELD_LIMITS: Record<string, number> = {
  display_name: 120,
  phone: 40,
  street_address: 180,
  street_address_2: 180,
  city: 120,
  state_province: 120,
  zip_code: 40,
  country: 120,
  billing_street_address: 180,
  billing_street_address_2: 180,
  billing_city: 120,
  billing_state_province: 120,
  billing_zip_code: 40,
  billing_country: 120,
};

const BOOLEAN_PROFILE_FIELDS = new Set(["use_shipping_as_billing"]);

const cleanEmail = (email: string) => email.trim().toLowerCase();

const cleanString = (value: unknown, maxLength: number) => {
  if (value == null) return null;
  const next = String(value).trim().replace(/[\u0000-\u001F\u007F]/g, "");
  return next ? next.slice(0, maxLength) : null;
};

function sanitizeProfileUpdates(updates: Record<string, unknown>) {
  const sanitized: Record<string, unknown> = {};

  for (const [key, maxLength] of Object.entries(PROFILE_FIELD_LIMITS)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      sanitized[key] = cleanString(updates[key], maxLength);
    }
  }

  for (const key of BOOLEAN_PROFILE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      sanitized[key] = Boolean(updates[key]);
    }
  }

  return sanitized;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (authUser: User) => {
    if (!isSupabaseConfigured || !authUser.email) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    if (data) {
      setProfile(data as Profile);
      return;
    }

    if (error) {
      setProfile(null);
      return;
    }

    const displayName = cleanString(authUser.user_metadata?.display_name, PROFILE_FIELD_LIMITS.display_name);
    const payload = {
      user_id: authUser.id,
      email: cleanEmail(authUser.email),
      display_name: displayName,
    };

    const { data: created, error: createError } = await supabase
      .from("profiles")
      .insert(payload)
      .select("*")
      .single();

    if (!createError && created) {
      setProfile(created as Profile);
      return;
    }

    const { data: retry } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", authUser.id)
      .maybeSingle();

    setProfile((retry as Profile | null) ?? null);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return unavailable();

    const { error } = await supabase.auth.signUp({
      email: cleanEmail(email),
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: cleanString(displayName, PROFILE_FIELD_LIMITS.display_name) },
      },
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string, rememberMe?: boolean): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return unavailable();

    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail(email), password });
    if (error) return { error: error.message };
    if (!rememberMe) {
      sessionStorage.setItem("ruvtier_session_only", "true");
    } else {
      sessionStorage.removeItem("ruvtier_session_only");
    }
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return unavailable();

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail(email), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updateProfile = async (updates: Record<string, unknown>): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured) return unavailable();
    if (!user) return { error: "Not authenticated" };

    const sanitized = sanitizeProfileUpdates(updates);
    if (Object.keys(sanitized).length === 0) return { error: "No profile changes supplied" };

    const { error } = await supabase
      .from("profiles")
      .update(sanitized as any)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    await ensureProfile(user);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signUp, signIn, signOut, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
