import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import AdminLayout from "../components/AdminLayout";
import { callAdminFunction } from "../lib/adminApi";
import { ArrowLeft, Save, ExternalLink } from "lucide-react";
import { ADMIN_PREFIX } from "../config";
import ImageUpload from "../components/ImageUpload";
import MediaGalleryUpload from "../components/MediaGalleryUpload";
import TagListEditor from "../components/TagListEditor";
import { toast } from "sonner";

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160, "Name too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers and dashes only"),
  collection: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  long_description: z.string().trim().max(4000).optional().or(z.literal("")),
  price: z.union([z.literal(""), z.coerce.number().min(0).max(1_000_000)]).optional(),
  compare_at_price: z.union([z.literal(""), z.coerce.number().min(0).max(1_000_000)]).optional(),
  sku: z.string().trim().max(64).regex(/^[A-Za-z0-9._\-/]*$/, "SKU may only contain letters, numbers, . _ - /").optional().or(z.literal("")),
  stock_quantity: z.coerce.number().int("Stock must be whole").min(0).max(1_000_000),
  materials: z.string().trim().max(240).optional().or(z.literal("")),
  care_info: z.string().trim().max(240).optional().or(z.literal("")),
  seo_title: z.string().trim().max(80).optional().or(z.literal("")),
  seo_description: z.string().trim().max(180).optional().or(z.literal("")),
  preorder_statement: z.string().trim().max(240).optional().or(z.literal("")),
});

const EMPTY_PRODUCT = {
  name: "",
  slug: "",
  collection: "",
  gender_segment: "",
  description: "",
  long_description: "",
  price: "",
  compare_at_price: "",
  sku: "",
  stock_quantity: "0",
  status: "draft",
  featured: false,
  materials: "",
  care_info: "",
  seo_title: "",
  seo_description: "",
  thumbnail_url: "",
  hero_image_url: "",
  preorder_enabled: false,
  preorder_statement: "",
  availability: "in_store",
  size_options: [] as string[],
  color_options: [] as string[],
  media_gallery: [] as string[],
};

type ProductFormState = typeof EMPTY_PRODUCT;

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

function toFormProduct(data: any): ProductFormState {
  return {
    name: data.name ?? "",
    slug: data.slug ?? "",
    collection: data.collection ?? "",
    gender_segment: data.gender_segment ?? "",
    description: data.description ?? "",
    long_description: data.long_description ?? "",
    price: data.price?.toString() ?? "",
    compare_at_price: data.compare_at_price?.toString() ?? "",
    sku: data.sku ?? "",
    stock_quantity: data.stock_quantity?.toString() ?? "0",
    status: data.status ?? "draft",
    featured: Boolean(data.featured),
    materials: data.materials ?? "",
    care_info: data.care_info ?? "",
    seo_title: data.seo_title ?? "",
    seo_description: data.seo_description ?? "",
    thumbnail_url: data.thumbnail_url ?? "",
    hero_image_url: data.hero_image_url ?? "",
    preorder_enabled: Boolean(data.preorder_enabled),
    preorder_statement: data.preorder_statement ?? "",
    availability: data.availability ?? "in_store",
    size_options: stringArray(data.size_options),
    color_options: stringArray(data.color_options),
    media_gallery: stringArray(data.media_gallery),
  };
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fontStyle = { fontFamily: "var(--font-sans)" };
  const inputClass = "w-full h-9 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[13px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors";
  const labelClass = "block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5";

  useEffect(() => {
    if (!isEditing || !id) return;

    setLoading(true);
    callAdminFunction<{ product: any }>("admin-products", { method: "GET", params: { id } })
      .then((data) => {
        if (!data.product) throw new Error("Garment not found");
        setForm(toFormProduct(data.product));
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Unable to load garment";
        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (key: keyof ProductFormState, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "name" && !isEditing) updated.slug = generateSlug(String(value));
      return updated;
    });
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    collection: form.collection.trim() || null,
    gender_segment: form.gender_segment || null,
    description: form.description.trim() || null,
    long_description: form.long_description.trim() || null,
    price: form.price === "" ? null : Number(form.price),
    compare_at_price: form.compare_at_price === "" ? null : Number(form.compare_at_price),
    sku: form.sku.trim() || null,
    stock_quantity: Number.parseInt(form.stock_quantity, 10) || 0,
    status: form.status,
    featured: form.featured,
    materials: form.materials.trim() || null,
    care_info: form.care_info.trim() || null,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
    thumbnail_url: form.thumbnail_url || "",
    hero_image_url: form.hero_image_url || "",
    preorder_enabled: form.preorder_enabled,
    preorder_statement: form.preorder_statement.trim() || null,
    availability: form.availability || "in_store",
    size_options: form.size_options,
    color_options: form.color_options,
    media_gallery: form.media_gallery,
  });

  const handleSave = async (opts?: { stay?: boolean }) => {
    setError(null);

    const validation = productSchema.safeParse(form);
    if (!validation.success) {
      const first = validation.error.issues[0];
      const message = first ? `${first.path.join(".")}: ${first.message}` : "Please check the form";
      setError(message);
      toast.error(message);
      return;
    }

    setSaving(true);
    try {
      const data = await callAdminFunction<{ product: { id: string } }>("admin-products", {
        method: isEditing ? "PATCH" : "POST",
        csrf: true,
        params: isEditing ? { id: id! } : undefined,
        body: buildPayload(),
      });

      toast.success(isEditing ? "Garment updated" : "Garment created");
      if (opts?.stay && data.product?.id) {
        navigate(`${ADMIN_PREFIX}/products/${data.product.id}`, { replace: true });
      } else {
        navigate(`${ADMIN_PREFIX}/products`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save garment";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const previewHref = form.slug
    ? form.preorder_enabled
      ? `/preorder/${form.slug}`
      : `/product/${form.slug}`
    : null;

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`${ADMIN_PREFIX}/products`)} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]" aria-label="Back to garments">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-[20px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
              {isEditing ? "Edit Garment" : "New Garment"}
            </h1>
            <p className="text-[11px] text-[hsl(220,10%,35%)] mt-1" style={fontStyle}>
              Writes are validated server-side and synced to the shared catalog tables.
            </p>
          </div>
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

      <div className="max-w-[860px] space-y-6">
        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Core Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={fontStyle}>Garment Name *</label>
              <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Slug *</label>
              <input value={form.slug} onChange={(e) => handleChange("slug", e.target.value)} className={inputClass} style={fontStyle} />
              <p className="text-[10px] text-[hsl(220,10%,30%)] mt-1" style={fontStyle}>URL: /product/{form.slug || "..."}</p>
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Collection</label>
              <input value={form.collection} onChange={(e) => handleChange("collection", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
            <div>
              <label className={labelClass} style={fontStyle}>Category</label>
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
            <textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} style={fontStyle} />
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>Long Description</label>
            <textarea value={form.long_description} onChange={(e) => handleChange("long_description", e.target.value)} rows={5} className={`${inputClass} h-auto py-2`} style={fontStyle} />
          </div>
        </section>

        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Pricing & Inventory</h2>
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
            <div>
              <label className={labelClass} style={fontStyle}>Availability</label>
              <select value={form.availability} onChange={(e) => handleChange("availability", e.target.value)} className={inputClass} style={fontStyle}>
                <option value="in_store">In Store</option>
                <option value="made_to_measure">Made-to-Measure</option>
                <option value="by_allocation">By Allocation</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => handleChange("featured", e.target.checked)} className="accent-[hsl(220,10%,70%)]" />
            <span className="text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>Featured on homepage</span>
          </label>
        </section>

        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Sizes & Colours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TagListEditor label="Available Sizes" value={form.size_options} onChange={(value) => handleChange("size_options", value)} placeholder="e.g. M" suggestions={["XS", "S", "M", "L", "XL", "XXL"]} />
            <TagListEditor label="Available Colours" value={form.color_options} onChange={(value) => handleChange("color_options", value)} placeholder="e.g. Ivory" suggestions={["Ivory", "Sand", "Charcoal", "Black", "Navy", "Camel"]} />
          </div>
        </section>

        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Material & Care</h2>
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
        </section>

        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Private Access / Preorder</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.preorder_enabled} onChange={(e) => handleChange("preorder_enabled", e.target.checked)} className="accent-[hsl(220,10%,70%)]" />
            <span className="text-[11px] text-[hsl(220,10%,55%)]" style={fontStyle}>Enable preorder or private access mode</span>
          </label>
          {form.preorder_enabled && (
            <div>
              <label className={labelClass} style={fontStyle}>Preorder Statement</label>
              <input value={form.preorder_statement} onChange={(e) => handleChange("preorder_statement", e.target.value)} className={inputClass} style={fontStyle} />
            </div>
          )}
        </section>

        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-5">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageUpload label="Thumbnail" value={form.thumbnail_url} onChange={(url) => handleChange("thumbnail_url", url)} folder="products/thumbnails" />
            <ImageUpload label="Hero Image" value={form.hero_image_url} onChange={(url) => handleChange("hero_image_url", url)} folder="products/heroes" />
          </div>
          <div className="pt-2 border-t border-[hsl(220,10%,14%)]">
            <MediaGalleryUpload value={form.media_gallery} onChange={(urls) => handleChange("media_gallery", urls)} folder="products/gallery" />
          </div>
        </section>

        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5 space-y-4">
          <h2 className="text-[12px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>SEO</h2>
          <div>
            <label className={labelClass} style={fontStyle}>SEO Title ({form.seo_title.length}/80)</label>
            <input value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} className={inputClass} style={fontStyle} maxLength={80} />
          </div>
          <div>
            <label className={labelClass} style={fontStyle}>SEO Description ({form.seo_description.length}/180)</label>
            <textarea value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} rows={2} className={`${inputClass} h-auto py-2`} style={fontStyle} maxLength={180} />
          </div>
        </section>

        {error && <p className="text-[12px] text-[hsl(0,60%,55%)]" style={fontStyle}>{error}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2 sticky bottom-4">
          <button
            onClick={() => handleSave({ stay: false })}
            disabled={saving}
            className="flex items-center gap-2 h-10 px-6 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[12px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            <Save size={14} /> {saving ? "Saving..." : isEditing ? "Save & Close" : "Create Garment"}
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
