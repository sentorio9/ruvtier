import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Link2, Users, Plus, Trash2 } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  email?: string;
}

export default function AdminSettings() {
  const { isSuperAdmin } = useAdminAuth();
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<string>("editor");
  const [granting, setGranting] = useState(false);
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    const { data } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
    if (data) {
      // Fetch profile emails for each role
      const enriched = await Promise.all(
        data.map(async (r) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("user_id", r.user_id)
            .maybeSingle();
          return { ...r, email: profile?.email || r.user_id };
        })
      );
      setRoles(enriched);
    }
    setLoadingRoles(false);
  };

  useEffect(() => {
    if (isSuperAdmin) fetchRoles();
  }, [isSuperAdmin]);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantError(null);
    setGrantSuccess(null);

    if (!newEmail.trim()) { setGrantError("Email is required"); return; }

    setGranting(true);

    // Look up user by email in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", newEmail.trim())
      .maybeSingle();

    if (!profile) {
      setGrantError("No registered user found with that email. They must register first.");
      setGranting(false);
      return;
    }

    // Check if role already exists
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", profile.user_id)
      .eq("role", newRole as any)
      .maybeSingle();

    if (existing) {
      setGrantError("User already has this role");
      setGranting(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: profile.user_id,
      role: newRole as any,
    });

    setGranting(false);
    if (error) {
      setGrantError(error.message);
    } else {
      setGrantSuccess(`Granted ${newRole} to ${newEmail.trim()}`);
      setNewEmail("");
      fetchRoles();
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    await supabase.from("user_roles").delete().eq("id", roleId);
    fetchRoles();
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    editor: "Editor",
    support_viewer: "Support Viewer",
  };

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

        {/* Admin User Management */}
        {isSuperAdmin && (
          <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
            <div className="flex items-center gap-3 mb-4">
              <Users size={16} className="text-[hsl(220,10%,40%)]" />
              <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>User Role Management</h2>
            </div>

            {/* Grant Role Form */}
            <form onSubmit={handleGrantRole} className="space-y-3 mb-6">
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="User email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 h-9 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,18%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors"
                  style={fontStyle}
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="h-9 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,18%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none"
                  style={fontStyle}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="support_viewer">Support Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={granting}
                  className="h-9 px-4 bg-[hsl(220,10%,80%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.1em] uppercase hover:bg-[hsl(220,10%,70%)] transition-colors disabled:opacity-40 flex items-center gap-2"
                  style={fontStyle}
                >
                  <Plus size={12} />
                  Grant
                </button>
              </div>
              {grantError && <p className="text-[11px] text-[hsl(0,60%,55%)]" style={fontStyle}>{grantError}</p>}
              {grantSuccess && <p className="text-[11px] text-[hsl(140,40%,50%)]" style={fontStyle}>{grantSuccess}</p>}
            </form>

            {/* Existing Roles */}
            <div className="space-y-1">
              <p className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,35%)] mb-2" style={fontStyle}>
                Current Roles
              </p>
              {loadingRoles ? (
                <p className="text-[12px] text-[hsl(220,10%,30%)]" style={fontStyle}>Loading...</p>
              ) : roles.length === 0 ? (
                <p className="text-[12px] text-[hsl(220,10%,30%)]" style={fontStyle}>No roles assigned yet</p>
              ) : (
                roles.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-[hsl(220,10%,12%)]">
                    <div>
                      <p className="text-[12px] text-[hsl(220,10%,70%)]" style={fontStyle}>{r.email}</p>
                      <p className="text-[10px] text-[hsl(220,10%,35%)]" style={fontStyle}>
                        {roleLabels[r.role] || r.role}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveRole(r.id)}
                      className="text-[hsl(220,10%,30%)] hover:text-[hsl(0,60%,55%)] transition-colors p-1"
                      title="Remove role"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
