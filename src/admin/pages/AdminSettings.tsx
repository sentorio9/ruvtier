import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Shield, Link2, Users } from "lucide-react";

export default function AdminSettings() {
  const { isSuperAdmin } = useAdminAuth();
  const fontStyle = { fontFamily: "var(--font-sans)" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Settings</h1>
      </div>

      <div className="max-w-[720px] space-y-4">
        {/* Security */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={16} className="text-[hsl(220,10%,40%)]" />
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>Security</h2>
          </div>
          <div className="space-y-2 text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>
            <p>• MFA enrollment: Available via authenticator app</p>
            <p>• Sessions: Managed through Lovable Cloud</p>
            <p>• Password policy: 14+ characters, mixed case, number, special char</p>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
          <div className="flex items-center gap-3 mb-3">
            <Link2 size={16} className="text-[hsl(220,10%,40%)]" />
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>Integrations</h2>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-[hsl(220,10%,12%)]">
            <div>
              <p className="text-[13px] text-[hsl(220,10%,65%)]" style={fontStyle}>Shopify</p>
              <p className="text-[11px] text-[hsl(220,10%,30%)]" style={fontStyle}>Product sync, orders, inventory</p>
            </div>
            <span className="text-[10px] tracking-[0.1em] uppercase text-[hsl(220,10%,30%)] border border-[hsl(220,10%,16%)] px-2 py-0.5" style={fontStyle}>
              Not connected
            </span>
          </div>
        </div>

        {/* Admin management */}
        {isSuperAdmin && (
          <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <Users size={16} className="text-[hsl(220,10%,40%)]" />
              <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>Admin Management</h2>
            </div>
            <p className="text-[12px] text-[hsl(220,10%,35%)]" style={fontStyle}>
              Admin users are managed through direct database access. Use Lovable Cloud to add users to the user_roles table.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
