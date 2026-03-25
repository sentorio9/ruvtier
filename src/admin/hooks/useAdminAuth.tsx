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

async function callAdminAuth(body: Record<string, unknown>) {
  const res = await fetch(ADMIN_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: API_KEY },
    body: JSON.stringify(body),
  });
  return res.json();
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

  // Validate existing session on mount
  useEffect(() => {
    const token = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!token) {
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
          localStorage.removeItem(SESSION_KEY);
          sessionStorage.removeItem(SESSION_KEY);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      })
      .finally(() => setLoading(false));
  }, [setSupabaseSession]);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    const data = await callAdminAuth({ action: "login", username, password, rememberMe });
    if (data.error) return { error: data.error, requestId: null };
    return { error: null, requestId: data.requestId as string };
  };

  const checkStatus = async (requestId: string) => {
    const data = await callAdminAuth({ action: "check-status", requestId });

    if (data.status === "approved" && data.sessionToken) {
      // Store session
      const rememberMe = !!localStorage.getItem("ruvtier_admin_remember");
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, data.sessionToken);
      } else {
        sessionStorage.setItem(SESSION_KEY, data.sessionToken);
      }

      setRole(data.role as AdminRole);
      setDisplayLabel(data.displayLabel);

      if (data.supabaseSession) {
        await setSupabaseSession(data.supabaseSession);
      }
    }

    return { status: data.status };
  };

  const signOut = async () => {
    const token = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (token) {
      await callAdminAuth({ action: "logout", sessionToken: token }).catch(() => {});
    }
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("ruvtier_admin_remember");
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
