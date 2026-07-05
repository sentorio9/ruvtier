import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { ADMIN_PREFIX } from "../config";
import { ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";

const fontStyle = { fontFamily: "var(--font-sans)" };

const FULFILMENT_OPTIONS = ["unfulfilled","processing","partially_fulfilled","fulfilled","cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [fulfilment, setFulfilment] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const [o, it, ev] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).maybeSingle(),
        supabase.from("order_items").select("*").eq("order_id", id),
        supabase.from("payment_events").select("*").eq("order_id", id).order("created_at", { ascending: false }),
      ]);
      setOrder(o.data);
      setItems((it.data as any) || []);
      setEvents((ev.data as any) || []);
      setNotes(o.data?.internal_notes || "");
      setFulfilment(o.data?.fulfilment_status || "unfulfilled");
      setLoading(false);
    }
    load();
  }, [id]);

  const save = async () => {
    const { error } = await supabase.from("orders").update({
      internal_notes: notes,
      fulfilment_status: fulfilment,
    } as any).eq("id", id!);
    if (error) toast.error(error.message);
    else toast.success("Order updated");
  };

  if (loading) return <AdminLayout><p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p></AdminLayout>;
  if (!order) return <AdminLayout><p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Order not found.</p></AdminLayout>;

  return (
    <AdminLayout>
      <Link to={`${ADMIN_PREFIX}/orders`} className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] mb-6" style={fontStyle}>
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <div className="mb-8">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>{order.order_number}</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
          {order.customer_name || order.customer_email || "—"} · {new Date(order.created_at).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <StatusBox label="Order" value={order.status} />
        <StatusBox label="Payment" value={order.payment_status || "—"} />
        <StatusBox label="Fulfilment" value={order.fulfilment_status || "unfulfilled"} />
      </div>

      <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 mb-6">
        <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-4" style={fontStyle}>Items</h2>
        {items.length === 0 ? (
          <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>No order items recorded.</p>
        ) : (
          <table className="w-full text-[12px]" style={fontStyle}>
            <thead className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)]">
              <tr><th className="text-left py-2">Product</th><th className="text-left">Variant</th><th className="text-left">SKU</th><th className="text-right">Qty</th><th className="text-right">Unit</th><th className="text-right">Total</th></tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i.id} className="border-t border-[hsl(220,10%,12%)] text-[hsl(220,10%,70%)]">
                  <td className="py-2">{i.product_title || "—"}</td>
                  <td>{[i.size, i.colour].filter(Boolean).join(" / ") || "—"}</td>
                  <td>{i.sku || "—"}</td>
                  <td className="text-right">{i.quantity}</td>
                  <td className="text-right">{i.unit_price ?? "—"}</td>
                  <td className="text-right">{i.total_price ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 mb-6">
        <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-3" style={fontStyle}>Stripe</h2>
        <dl className="text-[12px] space-y-1.5 text-[hsl(220,10%,65%)]" style={fontStyle}>
          <div><span className="text-[hsl(220,10%,40%)] mr-2">Session:</span>{order.stripe_checkout_session_id || "—"}</div>
          <div><span className="text-[hsl(220,10%,40%)] mr-2">Payment intent:</span>{order.stripe_payment_intent_id || "—"}</div>
          <div><span className="text-[hsl(220,10%,40%)] mr-2">Customer:</span>{order.stripe_customer_id || "—"}</div>
          <div><span className="text-[hsl(220,10%,40%)] mr-2">Provider:</span>{order.payment_provider || "—"}</div>
        </dl>
        <button
          disabled
          title="Stripe not configured"
          className="mt-4 h-9 px-4 text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,50%)] border border-[hsl(220,10%,20%)] opacity-40 cursor-not-allowed"
          style={fontStyle}
        >
          Issue refund
        </button>
      </section>

      <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 mb-6">
        <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-3" style={fontStyle}>Fulfilment</h2>
        <select
          value={fulfilment}
          onChange={e => setFulfilment(e.target.value)}
          className="h-10 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[12px] mb-3"
          style={fontStyle}
        >
          {FULFILMENT_OPTIONS.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
        </select>

        <label className="block mt-3">
          <span className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>Internal notes</span>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            className="mt-1 w-full px-3 py-2 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[12px]"
            style={fontStyle}
          />
        </label>

        <button
          onClick={save}
          className="mt-4 h-9 px-5 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)]"
          style={fontStyle}
        >
          Save changes
        </button>
      </section>

      <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
        <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] mb-3" style={fontStyle}>Payment events</h2>
        {events.length === 0 ? (
          <p className="text-[12px] text-[hsl(220,10%,40%)] flex items-center gap-2" style={fontStyle}>
            <Info size={12} /> No Stripe events for this order yet.
          </p>
        ) : (
          <ul className="space-y-2 text-[11px] text-[hsl(220,10%,65%)]" style={fontStyle}>
            {events.map(e => (
              <li key={e.id} className="flex items-center justify-between border-b border-[hsl(220,10%,12%)] pb-2">
                <span>{e.event_type}</span>
                <span className="text-[hsl(220,10%,40%)]">{new Date(e.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminLayout>
  );
}

function StatusBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-4">
      <p className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)]" style={fontStyle}>{label}</p>
      <p className="text-[14px] tracking-[0.08em] uppercase text-[hsl(220,10%,80%)] mt-1" style={fontStyle}>{value}</p>
    </div>
  );
}
