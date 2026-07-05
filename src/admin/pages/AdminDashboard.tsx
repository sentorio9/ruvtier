import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Package, ShoppingCart, Users, Activity, AlertCircle, Monitor, X, Boxes, ClipboardList, CalendarClock } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  archivedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  fulfilledOrders: number;
  totalCustomers: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  pendingAllocations: number;
  pendingAppointments: number;
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
    totalCustomers: 0,
    lowStockVariants: 0, outOfStockVariants: 0,
    pendingAllocations: 0, pendingAppointments: 0,
    recentLogs: [], activeSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [products, orders, customers, logs, sessions, variants, allocations, appointments] = await Promise.all([
        supabase.from("products").select("status", { count: "exact" }).is("deleted_at", null),
        supabase.from("orders").select("status", { count: "exact" }).is("deleted_at", null),
        supabase.from("customers").select("id", { count: "exact" }).is("deleted_at", null),
        supabase.from("audit_logs").select("id, action, actor_email, created_at").order("created_at", { ascending: false }).limit(10),
        supabase.from("admin_sessions").select("id, last_accessed_at, last_ip_address, last_user_agent, access_count, expires_at, credential_id").gt("expires_at", new Date().toISOString()).order("last_accessed_at", { ascending: false }),
        supabase.from("product_variants").select("available_quantity, low_stock_threshold, status"),
        supabase.from("preorder_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("appointment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
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
      const variantRows = (variants.data as any[]) || [];
      const lowStock = variantRows.filter(v => v.status === "active" && (v.available_quantity ?? 0) > 0 && (v.available_quantity ?? 0) <= (v.low_stock_threshold ?? 2)).length;
      const outOfStock = variantRows.filter(v => v.status === "active" && (v.available_quantity ?? 0) <= 0).length;

      setStats({
        totalProducts: productRows.length,
        activeProducts: productRows.filter(p => p.status === "active").length,
        archivedProducts: productRows.filter(p => p.status === "archived").length,
        totalOrders: orderRows.length,
        pendingOrders: orderRows.filter(o => o.status === "pending").length,
        fulfilledOrders: orderRows.filter(o => o.status === "fulfilled").length,
        totalCustomers: customers.count || 0,
        lowStockVariants: lowStock,
        outOfStockVariants: outOfStock,
        pendingAllocations: allocations.count || 0,
        pendingAppointments: appointments.count || 0,
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[11px] text-[hsl(220,10%,55%)]" style={{ fontFamily: "var(--font-sans)" }}>
                          {timeAgo(session.last_accessed_at)}
                        </p>
                        <p className="text-[10px] text-[hsl(220,10%,30%)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                          Expires {new Date(session.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      {isSuperAdmin && (
                        <button
                          onClick={() => revokeSession(session.id)}
                          disabled={revoking === session.id}
                          className="p-1.5 text-[hsl(0,50%,45%)] hover:text-[hsl(0,60%,55%)] hover:bg-[hsl(0,30%,15%)] transition-colors disabled:opacity-40"
                          title="Revoke session"
                        >
                          <X size={14} strokeWidth={2} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integration status */}
          <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 mb-8">
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-3" style={{ fontFamily: "var(--font-sans)" }}>
              Payment Readiness
            </h2>
            <div className="flex items-center gap-3">
              <AlertCircle size={14} className="text-[hsl(220,10%,35%)]" />
              <span className="text-[12px] text-[hsl(220,10%,40%)]" style={{ fontFamily: "var(--font-sans)" }}>
                Stripe — Not connected (preorder & allocation-only mode)
              </span>
            </div>
          </div>

          {/* Launch checklist */}
          <div className="bg-[hsl(40,30%,8%)] border border-[hsl(40,40%,18%)] p-5 mb-8">
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(40,50%,65%)] mb-3" style={{ fontFamily: "var(--font-sans)" }}>
              Launch Checklist
            </h2>

            <div className="flex items-start gap-3 mb-5">
              <AlertCircle size={14} className="text-[hsl(40,60%,55%)] mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-[12px] text-[hsl(40,30%,80%)] leading-[1.6]" style={{ fontFamily: "var(--font-sans)" }}>
                  Legal pages are placeholder copy and must be reviewed before full commercial launch.
                </p>
                <p className="text-[11px] text-[hsl(40,20%,55%)] leading-[1.6]" style={{ fontFamily: "var(--font-sans)" }}>
                  Replace [insert legal business name], [insert business address] and [insert contact email] across Privacy, Terms, Cookie, Shipping, Returns and Refund policies, and have copy reviewed by a qualified legal advisor before enabling live checkout.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-5 pt-4 border-t border-[hsl(40,40%,18%)]">
              <AlertCircle size={14} className="text-[hsl(40,60%,55%)] mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-[12px] text-[hsl(40,30%,80%)] leading-[1.6]" style={{ fontFamily: "var(--font-sans)" }}>
                  Add a backup admin approver before launch.
                </p>
                <p className="text-[11px] text-[hsl(40,20%,55%)] leading-[1.6]" style={{ fontFamily: "var(--font-sans)" }}>
                  A second super admin protects against lockout if the primary approver is unreachable. Add a new row to <span className="text-[hsl(40,30%,80%)]">admin_credentials</span> via a secure migration (hashed password, role <span className="text-[hsl(40,30%,80%)]">super_admin</span>), then mirror the user_id into <span className="text-[hsl(40,30%,80%)]">user_roles</span> with role <span className="text-[hsl(40,30%,80%)]">super_admin</span>. Never hardcode personal emails into the codebase.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[hsl(40,40%,18%)]">
              <p className="text-[11px] tracking-[0.14em] uppercase text-[hsl(40,50%,60%)] mb-3" style={{ fontFamily: "var(--font-sans)" }}>
                Production smoke test
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  "Contact form tested",
                  "Subscribe form tested",
                  "Maintenance form tested",
                  "Preorder form tested",
                  "Admin login tested",
                  "Product delete confirmation tested",
                  "Cart delete confirmation tested",
                  "Policy links tested",
                  "sitemap.xml reachable",
                  "robots.txt reachable",
                  "CookieConsent tested",
                  "Mobile menu tested",
                  "Search overlay tested",
                  "OG image renders on share preview",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[11px] text-[hsl(40,25%,72%)] leading-[1.7]" style={{ fontFamily: "var(--font-sans)" }}>
                    <span className="text-[hsl(40,40%,40%)] mt-0.5">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
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
