import { Outlet } from "react-router-dom";
import { AdminAuthProvider } from "../hooks/useAdminAuth";
import AdminGuard from "./AdminGuard";

/** Wraps all protected admin routes with auth provider + guard */
export function AdminProtectedLayout() {
  return (
    <AdminAuthProvider>
      <AdminGuard>
        <Outlet />
      </AdminGuard>
    </AdminAuthProvider>
  );
}

/** Wraps public admin routes (login) with auth provider only */
export function AdminPublicLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
