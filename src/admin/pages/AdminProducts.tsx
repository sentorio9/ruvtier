import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Plus, Search, Archive, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export default function AdminProducts() {
  const { user, isSuperAdmin } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchProducts = async () => {
    let query = supabase.from("products").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.ilike("name", `%${search}%`);
    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, statusFilter]);

  const archiveProduct = async (id: string) => {
    await supabase.from("products").update({ status: "archived", updated_by: user?.id }).eq("id", id);
    await supabase.from("audit_logs").insert({ action: "product_archived", actor_id: user?.id, actor_email: user?.email, target_type: "product", target_id: id });
    fetchProducts();
  };

  const softDelete = async (id: string) => {
    await supabase.from("products").update({ deleted_at: new Date().toISOString(), updated_by: user?.id }).eq("id", id);
    await supabase.from("audit_logs").insert({ action: "product_deleted", actor_id: user?.id, actor_email: user?.email, target_type: "product", target_id: id });
    setConfirmDelete(null);
    fetchProducts();
  };

  const statusColors: Record<string, string> = {
    draft: "text-[hsl(220,10%,50%)]",
    active: "text-[hsl(140,45%,50%)]",
    archived: "text-[hsl(40,60%,55%)]",
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={{ fontFamily: "var(--font-sans)" }}>
            Products
          </h1>
          <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            {products.length} total
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-2 h-9 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[300px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>
        {["all", "draft", "active", "archived"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
              statusFilter === s
                ? "text-[hsl(220,10%,85%)] bg-[hsl(220,15%,14%)]"
                : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={{ fontFamily: "var(--font-sans)" }}>Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[13px] text-[hsl(220,10%,35%)]" style={{ fontFamily: "var(--font-sans)" }}>No products found</p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Name", "SKU", "Status", "Price", "Stock", "Actions"].map((h) => (
                  <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={{ fontFamily: "var(--font-sans)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)] transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/admin/products/${p.id}`} className="text-[13px] text-[hsl(220,10%,75%)] hover:text-[hsl(220,10%,90%)]" style={{ fontFamily: "var(--font-sans)" }}>
                      {p.name}
                    </Link>
                    <p className="text-[10px] text-[hsl(220,10%,30%)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,45%)]" style={{ fontFamily: "var(--font-sans)" }}>{p.sku || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] tracking-[0.1em] uppercase ${statusColors[p.status] || ""}`} style={{ fontFamily: "var(--font-sans)" }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={{ fontFamily: "var(--font-sans)" }}>
                    {p.price ? `€${Number(p.price).toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={{ fontFamily: "var(--font-sans)" }}>{p.stock_quantity ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => archiveProduct(p.id)} title="Archive" className="text-[hsl(220,10%,35%)] hover:text-[hsl(40,60%,55%)] transition-colors">
                        <Archive size={14} />
                      </button>
                      {isSuperAdmin && (
                        confirmDelete === p.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => softDelete(p.id)} className="text-[10px] text-[hsl(0,60%,55%)] hover:text-[hsl(0,60%,65%)]" style={{ fontFamily: "var(--font-sans)" }}>Confirm</button>
                            <button onClick={() => setConfirmDelete(null)} className="text-[10px] text-[hsl(220,10%,40%)]" style={{ fontFamily: "var(--font-sans)" }}>Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(p.id)} title="Delete" className="text-[hsl(220,10%,35%)] hover:text-[hsl(0,50%,55%)] transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )
                      )}
                    </div>
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
