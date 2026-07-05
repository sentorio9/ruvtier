import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { toast } from "sonner";
import { AlertCircle, History, X } from "lucide-react";

type Row = {
  id: string;
  product_id: string;
  sku: string | null;
  size: string | null;
  colour: string | null;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number | null;
  low_stock_threshold: number | null;
  status: string;
  product?: { name: string; slug: string } | null;
};

type Movement = {
  id: string;
  variant_id: string | null;
  change_quantity: number;
  movement_type: string;
  reason: string | null;
  note: string | null;
  previous_quantity: number | null;
  new_quantity: number | null;
  created_at: string;
};

const fontStyle = { fontFamily: "var(--font-sans)" };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
  { key: "inactive", label: "Inactive" },
] as const;

const MOVEMENT_TYPES = [
  "stock_added","stock_removed","manual_adjustment",
  "returned","damaged","correction",
];

export default function AdminStock() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [adjustRow, setAdjustRow] = useState<Row | null>(null);
  const [history, setHistory] = useState<Movement[] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, product_id, sku, size, colour, stock_quantity, reserved_quantity, available_quantity, low_stock_threshold, status, product:products(name, slug)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("stock_movements")
      .select("id, variant_id, change_quantity, movement_type, reason, note, previous_quantity, new_quantity, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    setHistory((data as any) || []);
  };

  const filtered = rows.filter(r => {
    const avail = r.available_quantity ?? r.stock_quantity;
    if (filter === "low") return avail > 0 && avail <= (r.low_stock_threshold ?? 2);
    if (filter === "out") return avail <= 0 && r.status !== "inactive";
    if (filter === "inactive") return r.status === "inactive";
    return true;
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Stock</h1>
          <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>Adjust variant stock · every change is logged</p>
        </div>
        <button
          onClick={() => { setHistory(null); loadHistory(); }}
          className="flex items-center gap-2 h-9 px-4 text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,70%)] border border-[hsl(220,10%,20%)] hover:border-[hsl(220,10%,35%)] transition-colors"
          style={fontStyle}
        >
          <History size={14} /> History
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
              filter === f.key ? "text-[hsl(220,10%,85%)] bg-[hsl(220,15%,14%)]" : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
            }`}
            style={fontStyle}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[hsl(220,10%,14%)]">
          <p className="text-[13px] text-[hsl(220,10%,55%)]" style={fontStyle}>No variants match this filter</p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Product","SKU","Size","Colour","Stock","Reserved","Available","Status",""].map(h => (
                  <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const avail = r.available_quantity ?? r.stock_quantity;
                const low = avail > 0 && avail <= (r.low_stock_threshold ?? 2);
                const out = avail <= 0;
                return (
                  <tr key={r.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)]">
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,75%)]" style={fontStyle}>{r.product?.name || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>{r.sku || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{r.size || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{r.colour || "—"}</td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,75%)]" style={fontStyle}>{r.stock_quantity}</td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{r.reserved_quantity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] ${out ? "text-[hsl(0,50%,55%)]" : low ? "text-[hsl(40,60%,55%)]" : "text-[hsl(140,40%,55%)]"}`} style={fontStyle}>
                        {avail}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,50%)]" style={fontStyle}>{r.status}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setAdjustRow(r)}
                        className="text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,70%)] hover:text-[hsl(220,10%,90%)]"
                        style={fontStyle}
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {adjustRow && (
        <AdjustDrawer
          row={adjustRow}
          onClose={() => setAdjustRow(null)}
          onDone={() => { setAdjustRow(null); load(); }}
        />
      )}

      {history !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end" onClick={() => setHistory(null)}>
          <div className="w-full max-w-xl h-full bg-[hsl(220,15%,8%)] border-l border-[hsl(220,10%,14%)] p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] tracking-[0.1em] uppercase text-[hsl(220,10%,80%)]" style={fontStyle}>Stock history</h2>
              <button onClick={() => setHistory(null)} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]"><X size={16} /></button>
            </div>
            {history.length === 0 ? (
              <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>No stock movements yet.</p>
            ) : (
              <ul className="space-y-2">
                {history.map(m => (
                  <li key={m.id} className="p-3 border border-[hsl(220,10%,12%)] text-[11px]" style={fontStyle}>
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(220,10%,75%)] tracking-[0.1em] uppercase">{m.movement_type.replace(/_/g, " ")}</span>
                      <span className={`${m.change_quantity >= 0 ? "text-[hsl(140,40%,55%)]" : "text-[hsl(0,50%,55%)]"}`}>
                        {m.change_quantity >= 0 ? "+" : ""}{m.change_quantity}
                      </span>
                    </div>
                    <p className="text-[hsl(220,10%,45%)] mt-1">
                      {m.previous_quantity} → {m.new_quantity} · {new Date(m.created_at).toLocaleString()}
                    </p>
                    {(m.reason || m.note) && (
                      <p className="text-[hsl(220,10%,55%)] mt-1">{[m.reason, m.note].filter(Boolean).join(" · ")}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function AdjustDrawer({ row, onClose, onDone }: { row: Row; onClose: () => void; onDone: () => void }) {
  const [change, setChange] = useState<string>("0");
  const [type, setType] = useState<string>("stock_added");
  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const qty = Number(change);
    if (!Number.isFinite(qty) || qty === 0) { toast.error("Enter a non-zero quantity"); return; }
    setSaving(true);
    const { error } = await supabase.rpc("adjust_variant_stock", {
      p_variant_id: row.id,
      p_change_qty: qty,
      p_movement_type: type,
      p_reason: reason || null,
      p_note: note || null,
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Stock adjusted");
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-[hsl(220,15%,8%)] border-l border-[hsl(220,10%,14%)] p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[15px] tracking-[0.1em] uppercase text-[hsl(220,10%,80%)]" style={fontStyle}>Adjust stock</h2>
            <p className="text-[11px] text-[hsl(220,10%,45%)] mt-1" style={fontStyle}>{row.sku || "no SKU"} · {row.size || "—"} / {row.colour || "—"}</p>
          </div>
          <button onClick={onClose} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-2 p-3 border border-[hsl(220,10%,14%)] text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>
            <AlertCircle size={12} className="mt-0.5 text-[hsl(220,10%,40%)]" />
            Current stock: {row.stock_quantity} · use a negative number to decrement.
          </div>

          <label className="block">
            <span className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>Change</span>
            <input
              type="number"
              value={change}
              onChange={e => setChange(e.target.value)}
              className="mt-1 w-full h-10 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,85%)]"
              style={fontStyle}
            />
          </label>

          <label className="block">
            <span className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>Type</span>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="mt-1 w-full h-10 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,85%)]"
              style={fontStyle}
            >
              {MOVEMENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>Reason</span>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Delivery #482"
              className="mt-1 w-full h-10 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,85%)]"
              style={fontStyle}
            />
          </label>

          <label className="block">
            <span className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>Note</span>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,85%)]"
              style={fontStyle}
            />
          </label>

          <button
            onClick={submit}
            disabled={saving}
            className="w-full h-10 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[12px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] disabled:opacity-40"
            style={fontStyle}
          >
            {saving ? "Saving..." : "Save adjustment"}
          </button>
        </div>
      </div>
    </div>
  );
}
