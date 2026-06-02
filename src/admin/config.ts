const DEFAULT_ADMIN_PREFIX = "/123vhtg241s";

function normalizeAdminPrefix(value: string | undefined) {
  const raw = (value || DEFAULT_ADMIN_PREFIX).trim();
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = withSlash.replace(/\/+$/, "") || DEFAULT_ADMIN_PREFIX;

  if (!/^\/[A-Za-z0-9][A-Za-z0-9/_-]{5,}$/.test(normalized)) {
    return DEFAULT_ADMIN_PREFIX;
  }

  if (["/admin", "/dashboard", "/cms", "/login"].includes(normalized.toLowerCase())) {
    return DEFAULT_ADMIN_PREFIX;
  }

  return normalized;
}

export const ADMIN_PREFIX = normalizeAdminPrefix(import.meta.env.VITE_ADMIN_ROUTE);
