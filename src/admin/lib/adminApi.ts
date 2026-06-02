import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR } from "@/integrations/supabase/client";

const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const CSRF_KEY = "ruvtier_admin_csrf";

type AdminMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface AdminRequestOptions {
  method?: AdminMethod;
  body?: Record<string, unknown>;
  csrf?: boolean;
  params?: Record<string, string | number | boolean | null | undefined>;
}

function functionUrl(name: string, params?: AdminRequestOptions["params"]) {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const url = new URL(`${baseUrl}/functions/v1/${name}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export function getAdminCsrfToken() {
  try {
    return sessionStorage.getItem(CSRF_KEY);
  } catch {
    return null;
  }
}

export function storeAdminCsrfToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(CSRF_KEY, token);
    else sessionStorage.removeItem(CSRF_KEY);
  } catch {
    // Session checks reissue the CSRF token if storage is unavailable.
  }
}

export async function callAdminFunction<T = any>(name: string, options: AdminRequestOptions = {}): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_CONFIG_ERROR);
  }

  const headers: Record<string, string> = { apikey: API_KEY };
  if (options.body) headers["Content-Type"] = "application/json";
  if (options.csrf) {
    const csrf = getAdminCsrfToken();
    if (csrf) headers["x-ruvtier-csrf"] = csrf;
  }

  const res = await fetch(functionUrl(name, options.params), {
    method: options.method ?? "POST",
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

  if (!res.ok) {
    throw new Error(data?.error || "Admin request failed");
  }

  return data as T;
}
