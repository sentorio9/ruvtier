import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { ADMIN_PREFIX } from "../config";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(220,15%,6%)]">
        <div className="text-[12px] tracking-[0.15em] uppercase text-[hsl(220,10%,40%)]" style={{ fontFamily: "var(--font-sans)" }}>
          Verifying access...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to={`${ADMIN_PREFIX}/login`} replace />;
  }

  return <>{children}</>;
}
