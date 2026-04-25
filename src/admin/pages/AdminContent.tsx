import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { FileText, Save, X, ChevronDown } from "lucide-react";

interface ContentBlock {
  id: string;
  content_key: string;
  content_value: Record<string, string>;
  section: string;
  updated_at: string;
  updated_by: string | null;
}

const CONTENT_META: Record<string, { title: string; desc: string; fields: { key: string; label: string; type: "text" | "textarea" | "url" }[] }> = {
  footer_social: {
    title: "Footer & Social",
    desc: "Social media URLs shown in the footer",
    fields: [
      { key: "instagram", label: "Instagram URL", type: "url" },
      { key: "pinterest", label: "Pinterest URL", type: "url" },
      { key: "linkedin", label: "LinkedIn URL", type: "url" },
    ],
  },
  contact_details: {
    title: "Contact Details",
    desc: "Email, phone and address shown on the contact page",
    fields: [
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
    ],
  },
  seo_global: {
    title: "Global SEO",
    desc: "Default meta title & description used across the site",
    fields: [
      { key: "title", label: "Meta Title", type: "text" },
      { key: "description", label: "Meta Description", type: "textarea" },
    ],
  },
};

export default function AdminContent() {
  const { displayLabel } = useAdminAuth();
  const fontStyle = { fontFamily: "var(--font-sans)" };
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("site_content" as any)
      .select("*")
      .order("content_key")
      .then(({ data }) => {
        setBlocks((data as any) || []);
        setLoading(false);
      });
  }, []);

  const startEditing = (block: ContentBlock) => {
    setEditingKey(block.content_key);
    setEditValues({ ...(block.content_value as Record<string, string>) });
    setSaveSuccess(null);
  };

  const handleSave = async (block: ContentBlock) => {
    setSaving(true);
    await (supabase.from("site_content" as any) as any)
      .update({ content_value: editValues, updated_by: displayLabel })
      .eq("id", block.id);

    await supabase.from("audit_logs").insert({
      action: "content_updated",
      actor_email: displayLabel,
      target_type: "site_content",
      target_id: block.content_key,
    });

    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id ? { ...b, content_value: editValues, updated_by: displayLabel, updated_at: new Date().toISOString() } : b
      )
    );
    setSaving(false);
    setEditingKey(null);
    setSaveSuccess(block.content_key);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const inputClass =
    "w-full h-9 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,18%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors";

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Content</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>Site-wide content blocks. Click any card to edit.</p>
      </div>

      <div className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-4 mb-6 max-w-[900px]">
        <p className="text-[11px] text-[hsl(220,10%,55%)] leading-[1.7]" style={fontStyle}>
          Editorial pages (Homepage, The House, Stillness, Materials) are composed in dedicated templates. To revise their copy, request changes from your developer.
          <br />
          Product names, descriptions, prices and images are managed under <span className="text-[hsl(220,10%,80%)]">Products</span>.
        </p>
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[900px]">
          {blocks.map((block) => {
            const meta = CONTENT_META[block.content_key];
            if (!meta) return null;
            const isEditing = editingKey === block.content_key;
            const values = block.content_value as Record<string, string>;

            return (
              <div
                key={block.id}
                className={`bg-[hsl(220,15%,9%)] border transition-colors ${
                  isEditing ? "border-[hsl(220,10%,25%)] col-span-1 md:col-span-2" : "border-[hsl(220,10%,14%)] hover:border-[hsl(220,10%,20%)] cursor-pointer"
                }`}
              >
                <div
                  className="p-5"
                  onClick={() => !isEditing && startEditing(block)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <FileText size={14} className="text-[hsl(220,10%,35%)]" />
                      <h3 className="text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{meta.title}</h3>
                    </div>
                    {saveSuccess === block.content_key && (
                      <span className="text-[10px] text-[hsl(140,50%,50%)] tracking-[0.1em] uppercase" style={fontStyle}>Saved</span>
                    )}
                    {!isEditing && (
                      <ChevronDown size={14} className="text-[hsl(220,10%,30%)]" />
                    )}
                  </div>
                  <p className="text-[11px] text-[hsl(220,10%,35%)]" style={fontStyle}>{meta.desc}</p>
                  {block.updated_by && (
                    <p className="text-[10px] text-[hsl(220,10%,25%)] mt-2" style={fontStyle}>
                      Last updated by {block.updated_by} · {new Date(block.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="px-5 pb-5 space-y-3 border-t border-[hsl(220,10%,14%)] pt-4">
                    {meta.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5" style={fontStyle}>
                          {field.label}
                        </label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={editValues[field.key] || ""}
                            onChange={(e) => setEditValues((p) => ({ ...p, [field.key]: e.target.value }))}
                            rows={3}
                            className={`${inputClass} h-auto py-2`}
                            style={fontStyle}
                          />
                        ) : (
                          <input
                            value={editValues[field.key] || ""}
                            onChange={(e) => setEditValues((p) => ({ ...p, [field.key]: e.target.value }))}
                            className={inputClass}
                            style={fontStyle}
                          />
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleSave(block)}
                        disabled={saving}
                        className="flex items-center gap-2 h-8 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.1em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
                        style={fontStyle}
                      >
                        <Save size={12} /> {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="flex items-center gap-2 h-8 px-4 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] transition-colors"
                        style={fontStyle}
                      >
                        <X size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
