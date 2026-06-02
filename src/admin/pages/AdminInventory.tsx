import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { callAdminFunction } from "../lib/adminApi";
import { ADMIN_PREFIX } from "../config";
import { Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface InventoryVariant {
  id: string;
  title: string | null;
  sku: string | null;
  status: string | null;
  is_default: boolean | null;
  product_inventory?: Array<{ quantity_available: number | null; quantity_reserved?: number | null }>;
}

interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  status: string;
  stock_quantity: number | null;
  product_variants?: InventoryVariant[];
}

function variantQuantity(variant: InventoryVariant) {
  return (variant.product_inventory ?? []).reduce((sum, row) => sum + Number(row.quantity_available ?? 0), 0);
}

function productRows(product: InventoryProduct) {
  const variants = product.product_variants ?? [];
  if (variants.length === 0) {
    return [{
      key: product.id,
      product,
      variantTitle: "Default",
      sku: product.sku,
      quantity: Number(product.stock_quantity ?? 0),
      status: product.status,
    }];
  }

  return variants.map((variant) => ({
    key: variant.id,
    product,
    variantTitle: variant.title || (variant.is_default ? "Default" : "Variant"),
    sku: variant.sku || product.sku,
    quantity: variantQuantity(variant),
    status: variant.status || product.status,
  }));
}

export default function AdminInventory() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callAdminFunction<{ products: InventoryProduct[] }>("admin-products", {
        method: "GET",
        params: { status: "all", search, limit: 200 },
      });
      setProducts(data.products ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load inventory";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 180);
    return () => window.clearTimeout(timer);
  }, [search]);

  const rows = useMemo(() => products.flatMap(productRows), [products]);
  const totalUnits = rows.reduce((sum, row) => sum + row.quantity, 0);
  const lowStock = rows.filter((row) => row.quantity > 0 && row.quantity <= 3).length;
  const outOfStock = rows.filter((row) => row.quantity <= 0).length;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Inventory</h1>
          <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
            {totalUnits} units · {lowStock} low-stock variants · {outOfStock} out of stock
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 h-9 px-3 border border-[hsl(220,10%,18%)] text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] hover:text-[hsl(220,10%,85%)] hover:border-[hsl(220,10%,30%)] transition-colors"
          style={fontStyle}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="relative max-w-[340px] mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inventory..."
          className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
          style={fontStyle}
        />
      </div>

      {error && (
        <div className="mb-4 border border-[hsl(0,45%,24%)] bg-[hsl(0,30%,10%)] px-4 py-3 text-[12px] text-[hsl(0,55%,70%)]" style={fontStyle}>
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>No inventory found</p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Garment", "Variant", "SKU", "Status", "Available", "Action"].map((heading) => (
                  <th key={heading} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)]">
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{row.product.name}</p>
                    <p className="text-[10px] text-[hsl(220,10%,30%)] mt-0.5" style={fontStyle}>/{row.product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{row.variantTitle}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,50%)]" style={fontStyle}>{row.sku || "-"}</td>
                  <td className="px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,45%)]" style={fontStyle}>{row.status}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[13px] ${
                        row.quantity <= 0
                          ? "text-[hsl(0,55%,60%)]"
                          : row.quantity <= 3
                            ? "text-[hsl(40,65%,58%)]"
                            : "text-[hsl(140,45%,50%)]"
                      }`}
                      style={fontStyle}
                    >
                      {row.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`${ADMIN_PREFIX}/products/${row.product.id}`}
                      className="text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,80%)] transition-colors"
                      style={fontStyle}
                    >
                      Edit garment
                    </Link>
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
