import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { ShoppingBag, Search, Trash2 } from "lucide-react";

interface Cart {
  id: string;
  session_id: string | null;
  email: string | null;
  items: any[];
  item_count: number;
  subtotal: number;
  status: string;
  created_at: string;
  updated_at: string;
  abandoned_at: string | null;
  recovered_at: string | null;
}

export default function AdminCarts() {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fontStyle = { fontFamily: "var(--font-sans)" };

  const fetchCarts = async () => {
    let q = supabase.from("carts" as any).select("*").order("updated_at", { ascending: false }).limit(100) as any;
    if (statusFilter !== "all") q = q.eq("status", statusFilter);
    if (search) q = q.ilike("email", `%${search}%`);
    const { data } = await q;
    setCarts((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCarts(); }, [search, statusFilter]);

  const deleteCart = async (id: string) => {
    await (supabase.from("carts" as any) as any).delete().eq("id", id);
    setCarts((prev) => prev.filter((c) => c.id !== id));
  };

  const statusColors: Record<string, string> = {
    active: "text-[hsl(140,45%,50%)]",
    abandoned: "text-[hsl(40,60%,55%)]",
    converted: "text-[hsl(200,50%,55%)]",
    recovered: "text-[hsl(270,40%,55%)]",
  };

  const totalAbandoned = carts.filter((c) => c.status === "abandoned").length;
  const totalActive = carts.filter((c) => c.status === "active").length;
  const totalValue = carts.reduce((sum, c) => sum + (Number(c.subtotal) || 0), 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Carts</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>Active & abandoned cart tracking</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active Carts", value: totalActive, color: "text-[hsl(140,45%,50%)]" },
          { label: "Abandoned", value: totalAbandoned, color: "text-[hsl(40,60%,55%)]" },
          { label: "Total Cart Value", value: `€${totalValue.toFixed(2)}`, color: "text-[hsl(220,10%,75%)]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-4">
            <p className={`text-[22px] font-light ${stat.color}`} style={fontStyle}>{stat.value}</p>
            <p className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email..."
            className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
            style={fontStyle}
          />
        </div>
        {["all", "active", "abandoned", "converted", "recovered"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
              statusFilter === s
                ? "text-[hsl(220,10%,85%)] bg-[hsl(220,15%,14%)]"
                : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
            }`}
            style={fontStyle}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : carts.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={32} className="mx-auto text-[hsl(220,10%,20%)] mb-4" />
          <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>No carts recorded yet</p>
          <p className="text-[12px] text-[hsl(220,10%,25%)] mt-1" style={fontStyle}>
            Cart data will appear here as customers browse the store
          </p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Email / Session", "Items", "Subtotal", "Status", "Last Updated", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {carts.map((c) => (
                <tr key={c.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)]">
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,65%)]" style={fontStyle}>
                    {c.email || c.session_id?.slice(0, 12) || "—"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{c.item_count}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>€{Number(c.subtotal).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] tracking-[0.1em] uppercase ${statusColors[c.status] || ""}`} style={fontStyle}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[hsl(220,10%,35%)]" style={fontStyle}>
                    {new Date(c.updated_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteCart(c.id)} className="text-[hsl(220,10%,30%)] hover:text-[hsl(0,50%,55%)] transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
