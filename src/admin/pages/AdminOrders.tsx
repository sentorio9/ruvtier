import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../components/ConfirmModal";
import type { Tables } from "@/integrations/supabase/types";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Order = Tables<"orders">;

const statuses = ["pending", "paid", "processing", "fulfilled", "cancelled", "refunded", "archived"];

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
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const load = async () => {
    setLoading(true);
    let query = supabase.from("orders").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (order: Order, status: string) => {
    setBusyId(order.id);
    const patch: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (status === "cancelled") patch.cancelled_at = new Date().toISOString();
    if (status === "fulfilled") patch.fulfilled_at = new Date().toISOString();

    const { error } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Order ${order.order_number} updated`);
      await load();
    }
    setBusyId(null);
  };

  const removeOrder = async (order: Order) => {
    setBusyId(order.id);
    const { error } = await supabase
      .from("orders")
      .update({ deleted_at: new Date().toISOString(), status: "archived", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Order ${order.order_number} removed`);
      setPendingDelete(null);
      await load();
    }
    setBusyId(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Orders</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>View, cancel, remove, and update order status</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        {["all", ...statuses.filter((status) => status !== "archived")].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
              statusFilter === status ? "text-[hsl(220,10%,85%)] bg-[hsl(220,15%,14%)]" : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
            }`}
            style={fontStyle}
          >
            {status}
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
        <div className="border border-[hsl(220,10%,14%)] overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Order #", "Customer", "Status", "Payment", "Total", "Date", "Actions"].map((heading) => (
                  <th key={heading} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)]">
                  <td className="px-4 py-3 text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{order.order_number}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{order.customer_name || order.customer_email || "-"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={busyId === order.id}
                      onChange={(event) => updateStatus(order, event.target.value)}
                      className={`h-8 bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)] px-2 text-[11px] tracking-[0.1em] uppercase focus:outline-none ${statusColors[order.status] || "text-[hsl(220,10%,60%)]"}`}
                      style={fontStyle}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>{order.payment_status || "-"}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>€{Number(order.total ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[11px] text-[hsl(220,10%,35%)]" style={fontStyle}>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setPendingDelete(order)}
                      disabled={busyId === order.id}
                      aria-label={`Remove order ${order.order_number}`}
                      className="text-[hsl(220,10%,35%)] hover:text-[hsl(0,50%,55%)] transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Remove order ${pendingDelete?.order_number ?? ""}?`}
        description="This archives the order in the database and hides it from operational lists."
        confirmLabel="Remove order"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && removeOrder(pendingDelete)}
      />
    </AdminLayout>
  );
}
