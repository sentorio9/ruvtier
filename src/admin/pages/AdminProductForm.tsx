import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { ADMIN_PREFIX } from "../config";
import ImageUpload from "../components/ImageUpload";
import MediaGalleryUpload from "../components/MediaGalleryUpload";
import TagListEditor from "../components/TagListEditor";
import { toast } from "sonner";

const EMPTY_PRODUCT = {
  name: "", slug: "", collection: "", gender_segment: "", description: "", long_description: "",
  price: "", compare_at_price: "", sku: "", stock_quantity: "0", status: "draft",
  featured: false, materials: "", care_info: "", seo_title: "", seo_description: "",
  thumbnail_url: "", hero_image_url: "", preorder_enabled: false, preorder_statement: "",
  size_options: [] as string[], color_options: [] as string[], media_gallery: [] as string[],
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
            preorder_enabled: (data as any).preorder_enabled || false,
            preorder_statement: (data as any).preorder_statement || "",
            size_options: Array.isArray(data.size_options) ? (data.size_options as string[]) : [],
            color_options: Array.isArray(data.color_options) ? (data.color_options as string[]) : [],
            media_gallery: Array.isArray(data.media_gallery) ? (data.media_gallery as string[]) : [],
          });
        }
        setLoading(false);
      });
    }
  }, [id]);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleChange = (key: string, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "name" && !isEditing) updated.slug = generateSlug(value as string);
      return updated;
    });
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    collection: form.collection || null,
    gender_segment: form.gender_segment || null,
    description: form.description || null,
    long_description: form.long_description || null,
    price: form.price ? parseFloat(form.price) : null,
    compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
    sku: form.sku || null,
    stock_quantity: parseInt(form.stock_quantity) || 0,
    status: form.status,
    featured: form.featured,
    materials: form.materials || null,
    care_info: form.care_info || null,
    seo_title: form.seo_title || null,
    seo_description: form.seo_description || null,
    thumbnail_url: form.thumbnail_url || null,
    hero_image_url: form.hero_image_url || null,
    preorder_enabled: form.preorder_enabled,
    preorder_statement: form.preorder_statement || null,
    size_options: form.size_options as any,
    color_options: form.color_options as any,
    media_gallery: form.media_gallery as any,
  });

  const handleSave = async (opts?: { stay?: boolean }) => {
    setError(null);
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required");
      toast.error("Name and slug are required");
      return;
    }

    setSaving(true);
    const payload = buildPayload();

    if (isEditing) {
      const { error: err } = await supabase.from("products").update(payload).eq("id", id!);
      if (err) {
        setError(err.message);
        toast.error(err.message);
        setSaving(false);
        return;
      }
      await supabase.from("audit_logs").insert({
        action: "product_updated", actor_email: displayLabel, target_type: "product", target_id: id,
      });
      toast.success("Product updated");
      setSaving(false);
      if (!opts?.stay) navigate(`${ADMIN_PREFIX}/products`);
    } else {
      const { data, error: err } = await supabase.from("products").insert(payload).select("id").single();
      if (err) {
        setError(err.message);
        toast.error(err.message);
        setSaving(false);
        return;
      }
      await supabase.from("audit_logs").insert({
        action: "product_created", actor_email: displayLabel, target_type: "product", target_id: data?.id || form.slug,
      });
      toast.success("Product created");
      setSaving(false);
      if (opts?.stay && data?.id) {
        navigate(`${ADMIN_PREFIX}/products/${data.id}`, { replace: true });
      } else {
        navigate(`${ADMIN_PREFIX}/products`);
      }
    }
  };

  const inputClass = "w-full h-9 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[13px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors";
  const labelClass = "block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5";
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const previewHref = form.slug
    ? form.preorder_enabled
      ? `/preorder/${form.slug}`
      : `/product/${form.slug}`
    : null;

  if (loading) return (
    <AdminLayout>
      <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`${ADMIN_PREFIX}/products`)} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[20px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
            {isEditing ? "Edit Product" : "New Product"}
          </h1>
        </div>
        {isEditing && previewHref && (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,60%)] hover:text-[hsl(220,10%,85%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,30%)] transition-colors"
            style={fontStyle}
          >
            <ExternalLink size={12} /> View on site
          </a>
        )}
      </div>

      <div className="max-w-[820px] space-y-6">
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
              <p className="text-[10px] text-[hsl(220,10%,30%)] mt-1" style={fontStyle}>URL: /product/{form.slug || "..."}</p>
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Collection</label>
              <input value={form.collection} onChange={(e) => handleChange("collection", e.target.value)} className={inputClass} style={fontStyle} placeholder="e.g. Spring/Summer 2026" />
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
            <label className={labelClass} style={fontStyle}>Short Description</label>
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} style={fontStyle} placeholder="Used on cards & previews" />
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>Long Description / Editorial</label>
            <textarea value={form.long_description} onChange={(e) => handleChange("long_description", e.target.value)} rows={5} className={`${inputClass} h-auto py-2`} style={fontStyle} placeholder="Full editorial body shown on the product page" />
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
                <option value="draft">Draft (hidden)</option>
                <option value="active">Active (live)</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(e) => handleChange("featured", e.target.checked)} className="accent-[hsl(220,10%,70%)]" />
                <span className="text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>Featured on homepage</span>
              </label>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Sizes & Colours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TagListEditor
              label="Available Sizes"
              value={form.size_options}
              onChange={(v) => handleChange("size_options", v)}
              placeholder="e.g. M"
              suggestions={["XS", "S", "M", "L", "XL", "XXL"]}
            />
            <TagListEditor
              label="Available Colours"
              value={form.color_options}
              onChange={(v) => handleChange("color_options", v)}
              placeholder="e.g. Ivory"
              suggestions={["Ivory", "Sand", "Charcoal", "Black", "Navy", "Camel"]}
            />
          </div>
        </div>

        {/* Details */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Material & Care</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={fontStyle}>Materials</label>
              <input value={form.materials} onChange={(e) => handleChange("materials", e.target.value)} className={inputClass} style={fontStyle} placeholder="100% Cashmere" />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Care Information</label>
              <input value={form.care_info} onChange={(e) => handleChange("care_info", e.target.value)} className={inputClass} style={fontStyle} placeholder="Dry clean only" />
            </div>
          </div>
        </div>

        {/* Preorder */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Private Access / Preorder</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.preorder_enabled} onChange={(e) => handleChange("preorder_enabled", e.target.checked)} className="accent-[hsl(220,10%,70%)]" />
            <span className="text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>Enable preorder / private access mode</span>
          </label>
          {form.preorder_enabled && (
            <div>
              <label className={labelClass} style={fontStyle}>Preorder Statement</label>
              <input value={form.preorder_statement} onChange={(e) => handleChange("preorder_statement", e.target.value)} className={inputClass} style={fontStyle} placeholder="e.g. This piece is in quiet preparation." />
              <p className="text-[10px] text-[hsl(220,10%,35%)] mt-1" style={fontStyle}>
                When enabled, the public product link redirects to /preorder/{form.slug || "..."}
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-5">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload
              label="Thumbnail (card image)"
              value={form.thumbnail_url}
              onChange={(url) => handleChange("thumbnail_url", url)}
              folder="products/thumbnails"
            />
            <ImageUpload
              label="Hero Image (product page)"
              value={form.hero_image_url}
              onChange={(url) => handleChange("hero_image_url", url)}
              folder="products/heroes"
            />
          </div>
          <div className="pt-2 border-t border-[hsl(220,10%,14%)]">
            <MediaGalleryUpload
              value={form.media_gallery}
              onChange={(urls) => handleChange("media_gallery", urls)}
              folder="products/gallery"
            />
            <p className="text-[10px] text-[hsl(220,10%,35%)] mt-2" style={fontStyle}>
              The first image becomes the cover. Drag the arrows to reorder.
            </p>
          </div>
        </div>

        {/* SEO */}
        <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] mb-2" style={fontStyle}>SEO</h2>
          <div>
            <label className={labelClass} style={fontStyle}>SEO Title <span className="text-[hsl(220,10%,30%)] normal-case tracking-normal">({form.seo_title.length}/60)</span></label>
            <input value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} className={inputClass} style={fontStyle} maxLength={60} />
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>SEO Description <span className="text-[hsl(220,10%,30%)] normal-case tracking-normal">({form.seo_description.length}/160)</span></label>
            <textarea value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} rows={2} className={`${inputClass} h-auto py-2`} style={fontStyle} maxLength={160} />
          </div>
        </div>

        {error && (
          <p className="text-[12px] text-[hsl(0,60%,55%)]" style={fontStyle}>{error}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 sticky bottom-4">
          <button
            onClick={() => handleSave({ stay: false })}
            disabled={saving}
            className="flex items-center gap-2 h-10 px-6 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[12px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            <Save size={14} /> {saving ? "Saving..." : isEditing ? "Save & Close" : "Create Product"}
          </button>
          <button
            onClick={() => handleSave({ stay: true })}
            disabled={saving}
            className="h-10 px-5 text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,75%)] border border-[hsl(220,10%,20%)] hover:border-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,90%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            Save & Continue Editing
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
