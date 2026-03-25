import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { ArrowLeft, Save } from "lucide-react";
import { ADMIN_PREFIX } from "../config";
import ImageUpload from "../components/ImageUpload";

const EMPTY_PRODUCT = {
  name: "", slug: "", collection: "", gender_segment: "", description: "", long_description: "",
  price: "", compare_at_price: "", sku: "", stock_quantity: "0", status: "draft",
  featured: false, materials: "", care_info: "", seo_title: "", seo_description: "",
  thumbnail_url: "", hero_image_url: "",
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const { displayLabel } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
        if (data) {
          setForm({
            name: data.name, slug: data.slug, collection: data.collection || "",
            gender_segment: data.gender_segment || "", description: data.description || "",
            long_description: data.long_description || "", price: data.price?.toString() || "",
            compare_at_price: data.compare_at_price?.toString() || "", sku: data.sku || "",
            stock_quantity: data.stock_quantity?.toString() || "0", status: data.status,
            featured: data.featured || false, materials: data.materials || "",
            care_info: data.care_info || "", seo_title: data.seo_title || "",
            seo_description: data.seo_description || "", thumbnail_url: data.thumbnail_url || "",
            hero_image_url: data.hero_image_url || "",
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleChange = (key: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "name" && !isEditing) updated.slug = generateSlug(value as string);
      return updated;
    });
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name.trim() || !form.slug.trim()) { setError("Name and slug are required"); return; }

    setSaving(true);
    const payload = {
      name: form.name.trim(), slug: form.slug.trim(), collection: form.collection || null,
      gender_segment: form.gender_segment || null, description: form.description || null,
      long_description: form.long_description || null,
      price: form.price ? parseFloat(form.price) : null,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      sku: form.sku || null, stock_quantity: parseInt(form.stock_quantity) || 0,
      status: form.status, featured: form.featured, materials: form.materials || null,
      care_info: form.care_info || null, seo_title: form.seo_title || null,
      seo_description: form.seo_description || null, thumbnail_url: form.thumbnail_url || null,
      hero_image_url: form.hero_image_url || null,
    };

    if (isEditing) {
      const { error: err } = await supabase.from("products").update(payload).eq("id", id);
      if (err) { setError(err.message); setSaving(false); return; }
      await supabase.from("audit_logs").insert({ action: "product_updated", actor_email: displayLabel, target_type: "product", target_id: id });
    } else {
      const { error: err } = await supabase.from("products").insert(payload);
      if (err) { setError(err.message); setSaving(false); return; }
      await supabase.from("audit_logs").insert({ action: "product_created", actor_email: displayLabel, target_type: "product", target_id: form.slug });
    }

    setSaving(false);
    navigate(`${ADMIN_PREFIX}/products`);
  };

  const inputClass = "w-full h-9 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[13px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors";
  const labelClass = "block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5";
  const fontStyle = { fontFamily: "var(--font-sans)" };

  if (loading) return (
    <AdminLayout>
      <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(`${ADMIN_PREFIX}/products`)} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[20px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
          {isEditing ? "Edit Product" : "New Product"}
        </h1>
      </div>

      <div className="max-w-[720px] space-y-6">
        {/* Core info */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Core Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={fontStyle}>Product Name *</label>
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Slug *</label>
              <input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Collection</label>
              <input value={form.collection} onChange={(e) => handleChange("collection", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Gender Segment</label>
              <select value={form.gender_segment} onChange={(e) => handleChange("gender_segment", e.target.value)} className={inputClass} style={fontStyle}>
                <option value="">Select...</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>Description</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} style={fontStyle} />
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>Long Description / Editorial</label>
            <textarea value={form.long_description} onChange={(e) => handleChange("long_description", e.target.value)} rows={5} className={`${inputClass} h-auto py-2`} style={fontStyle} />
          </div>
        </div>

        {/* Pricing & inventory */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass} style={fontStyle}>Price (€)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Compare-at Price</label>
              <input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => handleChange("compare_at_price", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>SKU</label>
              <input value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Stock Quantity</label>
              <input type="number" value={form.stock_quantity} onChange={(e) => handleChange("stock_quantity", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={inputClass} style={fontStyle}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => handleChange("featured", e.target.checked)} className="accent-[hsl(220,10%,70%)]" />
                <span className="text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>Featured</span>
              </label>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={fontStyle}>Materials</label>
              <input value={form.materials} onChange={(e) => handleChange("materials", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Care Information</label>
              <input value={form.care_info} onChange={(e) => handleChange("care_info", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>SEO</h2>
          <div>
            <label className={labelClass} style={fontStyle}>SEO Title</label>
            <input value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} className={inputClass} style={fontStyle} maxLength={60} />
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>SEO Description</label>
            <textarea value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} rows={2} className={`${inputClass} h-auto py-2`} style={fontStyle} maxLength={160} />
          </div>
        </div>

        {/* Images */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={fontStyle}>Thumbnail URL</label>
              <input value={form.thumbnail_url} onChange={(e) => handleChange("thumbnail_url", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Hero Image URL</label>
              <input value={form.hero_image_url} onChange={(e) => handleChange("hero_image_url", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-[12px] text-[hsl(0,60%,55%)]" style={fontStyle}>{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-10 px-6 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[12px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            <Save size={14} /> {saving ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
          </button>
          <button
            onClick={() => navigate(`${ADMIN_PREFIX}/products`)}
            className="h-10 px-6 text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] transition-colors"
            style={fontStyle}
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
