import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { Package, ShoppingCart, Users, Activity, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  archivedProducts: number;
  totalOrders: number;
  pendingOrders: number;
  fulfilledOrders: number;
  totalCustomers: number;
  recentLogs: Array<{ id: string; action: string; actor_email: string | null; created_at: string }>;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0, activeProducts: 0, archivedProducts: 0,
    totalOrders: 0, pendingOrders: 0, fulfilledOrders: 0,
    totalCustomers: 0, recentLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [products, orders, customers, logs] = await Promise.all([
        supabase.from("products").select("status", { count: "exact" }).is("deleted_at", null),
        supabase.from("orders").select("status", { count: "exact" }).is("deleted_at", null),
        supabase.from("customers").select("id", { count: "exact" }).is("deleted_at", null),
        supabase.from("audit_logs").select("id, action, actor_email, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

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
      });
      setLoading(false);
    }
    load();
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
