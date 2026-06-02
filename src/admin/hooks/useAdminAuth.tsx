import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from "@/integrations/supabase/client";

type AdminRole = "super_admin" | "admin" | "editor" | "support_viewer";

interface AdminAuthState {
  role: AdminRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  displayLabel: string | null;
  csrfToken: string | null;
  login: (username: string, password: string, rememberMe: boolean) => Promise<{ error: string | null; requestId: string | null; authenticated?: boolean }>;
  checkStatus: (requestId: string) => Promise<{ status: string; error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CSRF_KEY = "ruvtier_admin_csrf";
const LEGACY_SESSION_KEY = "ruvtier_admin_session";
const REMEMBER_KEY = "ruvtier_admin_remember";

function functionUrl(name: string) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  return `${baseUrl}/functions/v1/${name}`;
}

function getStoredCsrf() {
  try {
    return sessionStorage.getItem(CSRF_KEY);
  } catch {
    return null;
  }
}

function storeCsrf(token: string | null) {
  try {
    if (token) sessionStorage.setItem(CSRF_KEY, token);
    else sessionStorage.removeItem(CSRF_KEY);
  } catch {
    // Ignore storage failures; the next session check will reissue a token.
  }
}

function clearLegacyStorage() {
  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // ignore
  }
}

async function callAdminFunction(
  name: string,
  options: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: Record<string, unknown>; csrf?: boolean } = {},
) {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  const method = options.method ?? "POST";
  const headers: Record<string, string> = {
    apikey: API_KEY,
  };

  if (options.body) headers["Content-Type"] = "application/json";
  if (options.csrf) {
    const csrf = getStoredCsrf();
    if (csrf) headers["x-ruvtier-csrf"] = csrf;
  }

  const res = await fetch(functionUrl(name), {
    method,
    headers,
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok && !data.error) {
    data.error = "Request failed";
  }

  return data;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole | null>(null);
  const [displayLabel, setDisplayLabel] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(() => getStoredCsrf());
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((data: any) => {
    if (data?.valid || data?.authenticated) {
      setRole(data.role as AdminRole);
      setDisplayLabel(data.displayLabel ?? null);
      if (data.csrfToken) {
        storeCsrf(data.csrfToken);
        setCsrfToken(data.csrfToken);
      }
      return true;
    }

    setRole(null);
    setDisplayLabel(null);
    storeCsrf(null);
    setCsrfToken(null);
    return false;
  }, []);

  useEffect(() => {
    clearLegacyStorage();

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    callAdminFunction("admin-session", { method: "GET" })
      .then((data) => applySession(data))
      .catch(() => applySession(null))
      .finally(() => setLoading(false));
  }, [applySession]);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    if (!isSupabaseConfigured) return { error: SUPABASE_CONFIG_ERROR, requestId: null };

    const data = await callAdminFunction("admin-login", {
      method: "POST",
      body: { username, password, rememberMe },
    });

    if (data.error) return { error: data.error, requestId: null };

    if (applySession(data)) {
      return { error: null, requestId: null, authenticated: true };
    }

    return { error: "Unable to start admin session", requestId: null };
  };

  const checkStatus = async (_requestId: string) => {
    const data = await callAdminFunction("admin-session", { method: "GET" });
    return applySession(data) ? { status: "approved" } : { status: "pending" };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && csrfToken) {
      await callAdminFunction("admin-session", { method: "DELETE", csrf: true }).catch(() => {});
    }

    clearLegacyStorage();
    storeCsrf(null);
    setCsrfToken(null);
    setRole(null);
    setDisplayLabel(null);
  };

  const isAdmin = role === "admin" || role === "super_admin" || role === "editor" || role === "support_viewer";
  const isSuperAdmin = role === "super_admin";

  return (
    <AdminAuthContext.Provider value={{ role, isAdmin, isSuperAdmin, loading, displayLabel, csrfToken, login, checkStatus, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
