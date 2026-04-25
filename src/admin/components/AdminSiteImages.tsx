import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "../hooks/useAdminAuth";
import ImageUpload from "./ImageUpload";
import { Image as ImageIcon } from "lucide-react";

interface SiteImageSlot {
  key: string;
  label: string;
  description: string;
  aspectRatio: number;
}

const SLOTS: SiteImageSlot[] = [
  { key: "site_image_home_hero", label: "Homepage Hero", description: "Full-bleed cinematic image at the top of the homepage.", aspectRatio: 16 / 9 },
  { key: "site_image_house_background", label: "The House — Background", description: "Editorial backdrop on the brand manifesto page.", aspectRatio: 16 / 9 },
  { key: "site_image_stillness_background", label: "Stillness — Background", description: "Calm imagery used on the Stillness page.", aspectRatio: 16 / 9 },
  { key: "site_image_materials_background", label: "Materials — Background", description: "Texture image at the top of the Materials index.", aspectRatio: 16 / 9 },
  { key: "site_image_editorial_cover", label: "Editorial Cover", description: "Used on editorial / lookbook overlays.", aspectRatio: 3 / 4 },
  { key: "site_image_social_share", label: "Social Share (OG)", description: "Image used when the site is shared on social media.", aspectRatio: 1.91 / 1 },
];

interface Row { id: string; content_key: string; content_value: { url?: string } }

export default function AdminSiteImages() {
  const { displayLabel } = useAdminAuth();
  const fontStyle = { fontFamily: "var(--font-sans)" };
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("site_content" as any)
        .select("id, content_key, content_value")
        .eq("section", "site_images");
      if (!active) return;
      const map: Record<string, Row> = {};
      ((data as any[]) || []).forEach((r) => { map[r.content_key] = r as Row; });
      setRows(map);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const persist = async (slot: SiteImageSlot, url: string) => {
    setSavingKey(slot.key);
    const existing = rows[slot.key];
    const value = { url };
    if (existing) {
      await (supabase.from("site_content" as any) as any)
        .update({ content_value: value, updated_by: displayLabel })
        .eq("id", existing.id);
    } else {
      const { data } = await (supabase.from("site_content" as any) as any)
        .insert({ content_key: slot.key, section: "site_images", content_value: value, updated_by: displayLabel })
        .select()
        .single();
      if (data) setRows((p) => ({ ...p, [slot.key]: data as Row }));
    }
    await supabase.from("audit_logs").insert({
      action: url ? "site_image_updated" : "site_image_cleared",
      actor_email: displayLabel,
      target_type: "site_content",
      target_id: slot.key,
    });
    setRows((p) => ({
      ...p,
      [slot.key]: { ...(p[slot.key] ?? { id: "", content_key: slot.key } as Row), content_value: value },
    }));
    setSavingKey(null);
    setSavedKey(slot.key);
    setTimeout(() => setSavedKey((k) => (k === slot.key ? null : k)), 1800);
  };

  return (
    <section className="mb-10 max-w-[1100px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImageIcon size={14} className="text-[hsl(220,10%,40%)]" />
          <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,75%)]" style={fontStyle}>
            Site Images
          </h2>
        </div>
        <span className="text-[10px] text-[hsl(220,10%,35%)]" style={fontStyle}>
          Stored in <span className="text-[hsl(220,10%,55%)]">site-images</span>
        </span>
      </div>
      <p className="text-[11px] text-[hsl(220,10%,45%)] mb-4 leading-[1.7]" style={fontStyle}>
        Editorial imagery used across hero, background, and social-share sections. Drop a file or click to upload, then crop. Use the Crop icon on a tile to recrop, or the X to remove.
      </p>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SLOTS.map((slot) => {
            const url = rows[slot.key]?.content_value?.url || "";
            return (
              <div key={slot.key} className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[12px] text-[hsl(220,10%,80%)]" style={fontStyle}>{slot.label}</h3>
                  {savingKey === slot.key && (
                    <span className="text-[10px] text-[hsl(220,10%,50%)] tracking-[0.1em] uppercase" style={fontStyle}>Saving…</span>
                  )}
                  {savedKey === slot.key && (
                    <span className="text-[10px] text-[hsl(140,50%,55%)] tracking-[0.1em] uppercase" style={fontStyle}>Saved</span>
                  )}
                </div>
                <p className="text-[11px] text-[hsl(220,10%,40%)] mb-3 leading-[1.6]" style={fontStyle}>{slot.description}</p>
                <ImageUpload
                  label=""
                  value={url}
                  onChange={(next) => persist(slot, next)}
                  bucket="site-images"
                  folder={slot.key}
                  aspectRatio={slot.aspectRatio}
                />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
