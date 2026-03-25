import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Package, ShoppingCart, Users, Activity, AlertCircle, Monitor, X } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  archivedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  fulfilledOrders: number;
  totalCustomers: number;
  recentLogs: Array<{ id: string; action: string; actor_email: string | null; created_at: string }>;
  activeSessions: Array<{
    id: string;
    last_accessed_at: string | null;
    last_ip_address: string | null;
    last_user_agent: string | null;
    access_count: number | null;
    expires_at: string;
    credential: { display_label: string | null; role: string } | null;
  }>;
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent?: string }) {
  return (
    <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon size={16} strokeWidth={1.5} className={accent || "text-[hsl(220,10%,40%)]"} />
      </div>
      <p className="text-[28px] font-light text-[hsl(220,10%,85%)]" style={{ fontFamily: "var(--font-sans)" }}>
        {value}
      </p>
      <p className="text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
        {label}
      </p>
    </div>
  );
}

function parseUA(ua: string | null): string {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  return ua.substring(0, 30);
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const ADMIN_AUTH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`;
const API_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SESSION_KEY = "ruvtier_admin_session";

export default function AdminDashboard() {
  const { isSuperAdmin } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, activeProducts: 0, archivedProducts: 0,
    totalOrders: 0, pendingOrders: 0, fulfilledOrders: 0,
    totalCustomers: 0, recentLogs: [], activeSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [products, orders, customers, logs, sessions] = await Promise.all([
        supabase.from("products").select("status", { count: "exact" }).is("deleted_at", null),
        supabase.from("orders").select("status", { count: "exact" }).is("deleted_at", null),
        supabase.from("customers").select("id", { count: "exact" }).is("deleted_at", null),
        supabase.from("audit_logs").select("id, action, actor_email, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("admin_sessions").select("id, last_accessed_at, last_ip_address, last_user_agent, access_count, expires_at, credential_id").gt("expires_at", new Date().toISOString()).order("last_accessed_at", { ascending: false }),
      ]);

      // Fetch credential info for sessions
      const sessionData = sessions.data || [];
      let enrichedSessions: DashboardStats["activeSessions"] = [];

      if (sessionData.length > 0) {
        const credIds = [...new Set(sessionData.map((s: any) => s.credential_id))];
        const { data: creds } = await supabase
          .from("admin_credentials")
          .select("id, display_label, role")
          .in("id", credIds);

        const credMap = new Map((creds || []).map((c: any) => [c.id, c]));
        enrichedSessions = sessionData.map((s: any) => ({
          ...s,
          credential: credMap.get(s.credential_id) || null,
        }));
      }

      const productRows = products.data || [];
      const orderRows = orders.data || [];

      setStats({
        totalProducts: productRows.length,
        activeProducts: productRows.filter(p => p.status === "active").length,
        archivedProducts: productRows.filter(p => p.status === "archived").length,
        totalOrders: orderRows.length,
        pendingOrders: orderRows.filter(o => o.status === "pending").length,
        fulfilledOrders: orderRows.filter(o => o.status === "fulfilled").length,
        totalCustomers: customers.count || 0,
        recentLogs: (logs.data || []) as DashboardStats["recentLogs"],
        activeSessions: enrichedSessions,
      });
      setLoading(false);
    }
    load();
  }, []);

  const revokeSession = useCallback(async (targetSessionId: string) => {
    const token = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!token) return;
    setRevoking(targetSessionId);
    try {
      const res = await fetch(ADMIN_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: API_KEY },
        body: JSON.stringify({ action: "revoke-session", sessionToken: token, targetSessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          activeSessions: prev.activeSessions.filter(s => s.id !== targetSessionId),
        }));
      }
    } catch {
      // silent
    } finally {
      setRevoking(null);
    }
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={{ fontFamily: "var(--font-sans)" }}>
          Dashboard
        </h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
          Operations overview
        </p>
      </div>

      {loading ? (
        <div className="text-[12px] text-[hsl(220,10%,40%)]" style={{ fontFamily: "var(--font-sans)" }}>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Products" value={stats.totalProducts} icon={Package} />
            <StatCard label="Active Products" value={stats.activeProducts} icon={Package} accent="text-[hsl(140,40%,50%)]" />
            <StatCard label="Archived" value={stats.archivedProducts} icon={Package} accent="text-[hsl(40,60%,55%)]" />
            <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
            <StatCard label="Pending Orders" value={stats.pendingOrders} icon={ShoppingCart} accent="text-[hsl(40,60%,55%)]" />
            <StatCard label="Fulfilled" value={stats.fulfilledOrders} icon={ShoppingCart} accent="text-[hsl(140,40%,50%)]" />
            <StatCard label="Customers" value={stats.totalCustomers} icon={Users} />
          </div>

          {/* Active Sessions */}
          <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 mb-8">
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
              Active Sessions
            </h2>
            {stats.activeSessions.length === 0 ? (
              <p className="text-[12px] text-[hsl(220,10%,30%)]" style={{ fontFamily: "var(--font-sans)" }}>No active sessions</p>
            ) : (
              <div className="space-y-3">
                {stats.activeSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-3 px-4 bg-[hsl(220,15%,7%)] border border-[hsl(220,10%,12%)]">
                    <div className="flex items-center gap-4">
                      <Monitor size={14} strokeWidth={1.5} className="text-[hsl(140,40%,50%)]" />
                      <div>
                        <p className="text-[12px] text-[hsl(220,10%,75%)]" style={{ fontFamily: "var(--font-sans)" }}>
                          {session.credential?.display_label || "Unknown Operator"}
                          <span className="ml-2 text-[10px] text-[hsl(220,10%,35%)] uppercase tracking-wider">
                            {session.credential?.role}
                          </span>
                        </p>
                        <p className="text-[11px] text-[hsl(220,10%,40%)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                          {session.last_ip_address || "—"} · {parseUA(session.last_user_agent)} · {session.access_count || 0} access{(session.access_count || 0) !== 1 ? "es" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[hsl(220,10%,55%)]" style={{ fontFamily: "var(--font-sans)" }}>
                        {timeAgo(session.last_accessed_at)}
                      </p>
                      <p className="text-[10px] text-[hsl(220,10%,30%)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                        Expires {new Date(session.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integration status */}
          <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 mb-8">
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-3" style={{ fontFamily: "var(--font-sans)" }}>
              Integrations
            </h2>
            <div className="flex items-center gap-3">
              <AlertCircle size={14} className="text-[hsl(220,10%,35%)]" />
              <span className="text-[12px] text-[hsl(220,10%,40%)]" style={{ fontFamily: "var(--font-sans)" }}>
                Shopify — Not connected
              </span>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
              Recent Activity
            </h2>
            {stats.recentLogs.length === 0 ? (
              <p className="text-[12px] text-[hsl(220,10%,30%)]" style={{ fontFamily: "var(--font-sans)" }}>No activity recorded yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 border-b border-[hsl(220,10%,12%)] last:border-0">
                    <div className="flex items-center gap-3">
                      <Activity size={12} className="text-[hsl(220,10%,35%)]" />
                      <span className="text-[12px] text-[hsl(220,10%,65%)]" style={{ fontFamily: "var(--font-sans)" }}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-[hsl(220,10%,35%)]" style={{ fontFamily: "var(--font-sans)" }}>
                        {log.actor_email}
                      </span>
                    </div>
                    <span className="text-[10px] text-[hsl(220,10%,30%)]" style={{ fontFamily: "var(--font-sans)" }}>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
