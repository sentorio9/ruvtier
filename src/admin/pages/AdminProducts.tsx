import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../components/ConfirmModal";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { callAdminFunction } from "../lib/adminApi";
import { Plus, Search, Archive, Trash2, ExternalLink, Copy, Image as ImageIcon, RefreshCw } from "lucide-react";
import { ADMIN_PREFIX } from "../config";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Product = Tables<"products"> & {
  product_variants?: Array<{
    id: string;
    title: string | null;
    sku: string | null;
    status: string | null;
    product_inventory?: Array<{ quantity_available: number | null }>;
  }>;
};

const statusColors: Record<string, string> = {
  draft: "text-[hsl(220,10%,50%)]",
  active: "text-[hsl(140,45%,50%)]",
  archived: "text-[hsl(40,60%,55%)]",
};

function stockFor(product: Product) {
  const inventory = product.product_variants?.flatMap((variant) => variant.product_inventory ?? []) ?? [];
  if (inventory.length > 0) {
    return inventory.reduce((sum, row) => sum + Number(row.quantity_available ?? 0), 0);
  }
  return Number(product.stock_quantity ?? 0);
}

function productPayload(product: Product, overrides: Record<string, unknown>) {
  return {
    name: product.name,
    slug: product.slug,
    collection: product.collection,
    gender_segment: product.gender_segment,
    description: product.description,
    long_description: product.long_description,
    price: product.price == null ? null : Number(product.price),
    compare_at_price: product.compare_at_price == null ? null : Number(product.compare_at_price),
    sku: product.sku,
    stock_quantity: Number(product.stock_quantity ?? stockFor(product)),
    status: product.status,
    featured: Boolean(product.featured),
    materials: product.materials,
    care_info: product.care_info,
    seo_title: product.seo_title,
    seo_description: product.seo_description,
    thumbnail_url: product.thumbnail_url,
    hero_image_url: product.hero_image_url,
    preorder_enabled: Boolean((product as any).preorder_enabled),
    preorder_statement: (product as any).preorder_statement ?? null,
    availability: (product as any).availability ?? "in_store",
    size_options: Array.isArray(product.size_options) ? product.size_options : [],
    color_options: Array.isArray(product.color_options) ? product.color_options : [],
    media_gallery: Array.isArray(product.media_gallery) ? product.media_gallery : [],
    ...overrides,
  };
}

export default function AdminProducts() {
  const { isSuperAdmin } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fontStyle = { fontFamily: "var(--font-sans)" };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callAdminFunction<{ products: Product[] }>("admin-products", {
        method: "GET",
        params: { status: statusFilter, search, limit: 200 },
      });
      setProducts(data.products ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load garments";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchProducts, 180);
    return () => window.clearTimeout(timer);
  }, [search, statusFilter]);

  const archiveProduct = async (product: Product) => {
    setBusyId(product.id);
    try {
      await callAdminFunction("admin-products", {
        method: "PATCH",
        csrf: true,
        params: { id: product.id },
        body: { status: "archived" },
      });
      toast.success(`${product.name} archived`);
      await fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to archive garment");
    } finally {
      setBusyId(null);
    }
  };

  const softDelete = async (product: Product) => {
    setBusyId(product.id);
    try {
      await callAdminFunction("admin-products", {
        method: "DELETE",
        csrf: true,
        params: { id: product.id },
      });
      toast.success(`${product.name} deleted`);
      setPendingDelete(null);
      await fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete garment");
    } finally {
      setBusyId(null);
    }
  };

  const duplicateProduct = async (product: Product) => {
    setBusyId(product.id);
    try {
      const suffix = Date.now().toString(36);
      await callAdminFunction("admin-products", {
        method: "POST",
        csrf: true,
        body: productPayload(product, {
          slug: `${product.slug}-copy-${suffix}`,
          name: `${product.name} (Copy)`,
          status: "draft",
          featured: false,
        }),
      });
      toast.success(`${product.name} duplicated`);
      await fetchProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to duplicate garment");
    } finally {
      setBusyId(null);
    }
  };

  const totals = useMemo(() => ({
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    draft: products.filter((p) => p.status === "draft").length,
    stock: products.reduce((sum, p) => sum + stockFor(p), 0),
  }), [products]);

  const previewHref = (product: Product) =>
    (product as any).preorder_enabled ? `/preorder/${product.slug}` : `/product/${product.slug}`;

  return (
    <AdminLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
            Garments
          </h1>
          <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
            {totals.total} total · {totals.active} active · {totals.draft} draft · {totals.stock} units
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 h-9 px-3 border border-[hsl(220,10%,18%)] text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,60%)] hover:text-[hsl(220,10%,85%)] hover:border-[hsl(220,10%,30%)] transition-colors"
            style={fontStyle}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <Link
            to={`${ADMIN_PREFIX}/products/new`}
            className="flex items-center gap-2 h-9 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors"
            style={fontStyle}
          >
            <Plus size={14} /> New Garment
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-[340px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search garments..."
            className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
            style={fontStyle}
          />
        </div>
        {["all", "draft", "active", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`text-[11px] tracking-[0.1em] uppercase px-3 py-1.5 transition-colors ${
              statusFilter === status
                ? "text-[hsl(220,10%,85%)] bg-[hsl(220,15%,14%)]"
                : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
            }`}
            style={fontStyle}
          >
            {status}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 border border-[hsl(0,45%,24%)] bg-[hsl(0,30%,10%)] px-4 py-3 text-[12px] text-[hsl(0,55%,70%)]" style={fontStyle}>
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[hsl(220,10%,14%)]">
          <p className="text-[13px] text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>No garments found</p>
          <Link
            to={`${ADMIN_PREFIX}/products/new`}
            className="inline-flex items-center gap-2 h-9 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors"
            style={fontStyle}
          >
            <Plus size={14} /> New Garment
          </Link>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["", "Garment", "SKU", "Status", "Price", "Inventory", "Sync", "Actions"].map((heading, index) => (
                  <th key={index} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const busy = busyId === product.id;
                return (
                  <tr key={product.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)] transition-colors">
                    <td className="px-4 py-3 w-[64px]">
                      <Link to={`${ADMIN_PREFIX}/products/${product.id}`} className="block w-10 h-12 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,14%)] overflow-hidden">
                        {product.thumbnail_url ? (
                          <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[hsl(220,10%,25%)]">
                            <ImageIcon size={14} />
                          </div>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`${ADMIN_PREFIX}/products/${product.id}`} className="text-[13px] text-[hsl(220,10%,75%)] hover:text-[hsl(220,10%,90%)]" style={fontStyle}>
                        {product.name}
                      </Link>
                      <p className="text-[10px] text-[hsl(220,10%,30%)] mt-0.5" style={fontStyle}>
                        /{product.slug}
                        {(product as any).preorder_enabled && <span className="ml-2 text-[hsl(40,60%,55%)]">· Preorder</span>}
                        {product.featured && <span className="ml-2 text-[hsl(220,10%,55%)]">· Featured</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,45%)]" style={fontStyle}>{product.sku || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] tracking-[0.1em] uppercase ${statusColors[product.status] || ""}`} style={fontStyle}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>
                      {product.price != null ? `€${Number(product.price).toFixed(2)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{stockFor(product)}</td>
                    <td className="px-4 py-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,40%)]" style={fontStyle}>
                      {(product as any).sync_status || "pending"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.status === "active" && (
                          <a
                            href={previewHref(product)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on site"
                            className="text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,75%)] transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button disabled={busy} onClick={() => duplicateProduct(product)} title="Duplicate" className="text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,75%)] transition-colors disabled:opacity-30">
                          <Copy size={14} />
                        </button>
                        <button disabled={busy || product.status === "archived"} onClick={() => archiveProduct(product)} title="Archive" className="text-[hsl(220,10%,35%)] hover:text-[hsl(40,60%,55%)] transition-colors disabled:opacity-30">
                          <Archive size={14} />
                        </button>
                        {isSuperAdmin && (
                          <button
                            disabled={busy}
                            onClick={() => setPendingDelete(product)}
                            title="Delete"
                            className="text-[hsl(220,10%,35%)] hover:text-[hsl(0,50%,55%)] transition-colors disabled:opacity-30"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete ${pendingDelete?.name ?? "garment"}?`}
        description="This soft-deletes the garment, archives its variants, and hides it from the public site."
        confirmLabel="Delete garment"
        requirePhrase={pendingDelete?.name}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && softDelete(pendingDelete)}
      />
    </AdminLayout>
  );
}
