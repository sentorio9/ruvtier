import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const statusColors: Record<string, string> = {
  pending: "text-[hsl(40,60%,55%)]",
  paid: "text-[hsl(200,50%,55%)]",
  processing: "text-[hsl(220,50%,60%)]",
  fulfilled: "text-[hsl(140,45%,50%)]",
  cancelled: "text-[hsl(0,50%,55%)]",
  refunded: "text-[hsl(280,30%,55%)]",
  archived: "text-[hsl(220,10%,40%)]",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function load() {
      let q = supabase.from("orders").select("*").is("deleted_at", null).order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data } = await q;
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, [statusFilter]);

  const fontStyle = { fontFamily: "var(--font-sans)" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Orders</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>Future-ready order management</p>
      </div>

      <div className="mb-6 px-4 py-3 bg-[hsl(40,30%,8%)] border border-[hsl(40,40%,18%)] flex items-start gap-3">
        <span className="text-[10px] tracking-[0.2em] uppercase text-[hsl(40,55%,60%)] mt-0.5" style={fontStyle}>Notice</span>
        <p className="text-[12px] text-[hsl(40,30%,75%)] leading-[1.6]" style={fontStyle}>
          Preorder & allocation-only mode active · No live Stripe checkout connected · Orders will populate here once Stripe checkout is enabled.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {["all", "pending", "paid", "processing", "fulfilled", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
              statusFilter === s ? "text-[hsl(220,10%,85%)] bg-[hsl(220,15%,14%)]" : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
            }`}
            style={fontStyle}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>No orders yet</p>
          <p className="text-[12px] text-[hsl(220,10%,25%)] mt-1" style={fontStyle}>Orders will appear here once commerce is live</p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Order #", "Customer", "Status", "Total", "Date"].map((h) => (
                  <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)]">
                  <td className="px-4 py-3 text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{o.order_number}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{o.customer_name || o.customer_email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] tracking-[0.1em] uppercase ${statusColors[o.status] || ""}`} style={fontStyle}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>€{Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[11px] text-[hsl(220,10%,35%)]" style={fontStyle}>{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
