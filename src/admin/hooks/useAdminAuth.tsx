import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminRole = "super_admin" | "admin" | "editor" | "support_viewer";

interface AdminAuthState {
  role: AdminRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  displayLabel: string | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<{ error: string | null; requestId: string | null }>;
  checkStatus: (requestId: string) => Promise<{ status: string; error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const ADMIN_AUTH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SESSION_KEY = "ruvtier_admin_session";
const REMEMBER_KEY = "ruvtier_admin_remember";

async function callAdminAuth(body: Record<string, unknown>) {
  const res = await fetch(ADMIN_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: API_KEY },
    body: JSON.stringify(body),
  });
  return res.json();
}

function getStoredSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function storeSession(token: string) {
  sessionStorage.setItem(SESSION_KEY, token);
}

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(REMEMBER_KEY);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [displayLabel, setDisplayLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setSupabaseSession = useCallback(async (session: { access_token: string; refresh_token: string } | null) => {
    if (session?.access_token && session?.refresh_token) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }
  }, []);

  // Validate existing session on mount. Admin sessions are intentionally limited
  // to sessionStorage so they are not persisted after the browser session ends.
  useEffect(() => {
    const token = getStoredSession();
    if (!token) {
      clearStoredSession();
      setLoading(false);
      return;
    }

    callAdminAuth({ action: "validate", sessionToken: token })
      .then(async (data) => {
        if (data.valid) {
          setRole(data.role as AdminRole);
          setDisplayLabel(data.displayLabel);
          if (data.supabaseSession) {
            await setSupabaseSession(data.supabaseSession);
          }
        } else {
          clearStoredSession();
        }
      })
      .catch(() => {
        clearStoredSession();
      })
      .finally(() => setLoading(false));
  }, [setSupabaseSession]);

  const login = async (username: string, password: string, _rememberMe: boolean) => {
    const data = await callAdminAuth({ action: "login", username, password, rememberMe: false });
    if (data.error) return { error: data.error, requestId: null };
    return { error: null, requestId: data.requestId as string };
  };

  const checkStatus = async (requestId: string) => {
    const data = await callAdminAuth({ action: "check-status", requestId });

    if (data.status === "approved" && data.sessionToken) {
      storeSession(data.sessionToken);
      localStorage.removeItem(REMEMBER_KEY);

      setRole(data.role as AdminRole);
      setDisplayLabel(data.displayLabel);

      if (data.supabaseSession) {
        await setSupabaseSession(data.supabaseSession);
      }
    }

    return { status: data.status };
  };

  const signOut = async () => {
    const token = getStoredSession();
    if (token) {
      await callAdminAuth({ action: "logout", sessionToken: token }).catch(() => {});
    }
    clearStoredSession();
    await supabase.auth.signOut();
    setRole(null);
    setDisplayLabel(null);
  };

  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";

  return (
    <AdminAuthContext.Provider value={{ role, isAdmin, isSuperAdmin, loading, displayLabel, login, checkStatus, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
