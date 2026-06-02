import { Outlet } from "react-router-dom";
import { AdminAuthProvider } from "../hooks/useAdminAuth";
import AdminGuard from "./AdminGuard";
import AdminNoIndex from "./AdminNoIndex";

export function AdminProtectedLayout() {
  return (
    <AdminAuthProvider>
      <AdminNoIndex />
      <AdminGuard>
        <Outlet />
      </AdminGuard>
    </AdminAuthProvider>
  );
}

export function AdminPublicLayout() {
  return (
    <AdminAuthProvider>
      <AdminNoIndex />
      <Outlet />
    </AdminAuthProvider>
  );
}
