import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Customer = Tables<"customers">;

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      let q = supabase.from("customers").select("*").is("deleted_at", null).order("created_at", { ascending: false });
      if (search) q = q.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
      const { data } = await q;
      setCustomers(data || []);
      setLoading(false);
    }
    load();
  }, [search]);

  const fontStyle = { fontFamily: "var(--font-sans)" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Customers</h1>
      </div>

      <div className="relative max-w-[300px] mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
          style={fontStyle}
        />
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : customers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>No customers yet</p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Name", "Email", "Orders", "Total Spend", "Status", "Last Active"].map((h) => (
                  <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)]">
                  <td className="px-4 py-3 text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{c.name || "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{c.email}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{c.order_count}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>€{Number(c.total_spend).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(140,45%,50%)]" style={fontStyle}>{c.status}</td>
                  <td className="px-4 py-3 text-[11px] text-[hsl(220,10%,35%)]" style={fontStyle}>
                    {c.last_activity_at ? new Date(c.last_activity_at).toLocaleDateString() : "—"}
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
