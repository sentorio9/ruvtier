import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Globe, Monitor, Tablet, Smartphone, RotateCcw, Undo2,
  ExternalLink, ChevronRight, X, Save, Loader2, Image as ImageIcon, Type
} from "lucide-react";
import ImageUpload from "../components/ImageUpload";

type EditableKind = "site_image" | "text_block" | "product_card" | "page_meta" | "footer_link";

interface EditableTarget {
  kind: EditableKind;
  key?: string;
  field?: string;
  label?: string;
  productId?: string;
  path: string;
  rect: { x: number; y: number; width: number; height: number };
}

interface UndoEntry {
  contentKey: string;
  field?: string;
  previousValue: any;
  nextValue: any;
  label: string;
  at: number;
}

const PAGES: { label: string; path: string; group: string }[] = [
  { group: "Main", label: "Home", path: "/" },
  { group: "Main", label: "The House", path: "/the-house" },
  { group: "Main", label: "Stillness", path: "/stillness" },
  { group: "Main", label: "Materials", path: "/materials" },
  { group: "Main", label: "Collection", path: "/collection" },
  { group: "Main", label: "Contact", path: "/contact" },
  { group: "Boutique", label: "Online Boutique", path: "/boutique" },
  { group: "Boutique", label: "Women", path: "/boutique/women" },
  { group: "Boutique", label: "Men", path: "/boutique/men" },
  { group: "Boutique", label: "Lifestyle", path: "/boutique/lifestyle" },
  { group: "Boutique", label: "Children", path: "/boutique/children" },
  { group: "Boutique", label: "Footwear", path: "/boutique/footwear" },
  { group: "Boutique", label: "Made-to-Measure", path: "/boutique/made-to-measure" },
  { group: "Boutique", label: "Home Interiors", path: "/boutique/home-interiors" },
  { group: "Boutique", label: "Leather Goods", path: "/boutique/leather-goods" },
  { group: "Boutique", label: "Accessories", path: "/boutique/accessories" },
  { group: "Boutique", label: "Textiles", path: "/boutique/textiles" },
  { group: "Boutique", label: "Objects", path: "/boutique/objects" },
  { group: "Boutique", label: "Fragrance", path: "/boutique/fragrance" },
  { group: "Editorial", label: "Rituals of Care", path: "/rituals-of-care" },
  { group: "Editorial", label: "Home Interior", path: "/home-interior" },
  { group: "Editorial", label: "First Garment", path: "/garment" },
  { group: "Service", label: "Appointments", path: "/appointments" },
  { group: "Service", label: "Find a Boutique", path: "/find-boutique" },
  { group: "Service", label: "Shipping", path: "/shipping" },
  { group: "Service", label: "FAQ", path: "/faq" },
  { group: "Service", label: "Craft Career", path: "/craft-career" },
  { group: "Legal", label: "Privacy Policy", path: "/privacy-policy" },
  { group: "Legal", label: "Terms", path: "/terms" },
];

const VIEWPORTS = {
  desktop: { label: "Desktop", icon: Monitor, width: "100%", height: "100%" },
  tablet:  { label: "Tablet",  icon: Tablet,  width: 820,    height: 1180 },
  mobile:  { label: "Mobile",  icon: Smartphone, width: 390, height: 844 },
} as const;
type ViewportKey = keyof typeof VIEWPORTS;

const fontStyle = { fontFamily: "var(--font-sans)" };

export default function AdminWebsiteEditor() {
  const { displayLabel } = useAdminAuth();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [currentPath, setCurrentPath] = useState("/");
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportKey>("desktop");
  const [selected, setSelected] = useState<EditableTarget | null>(null);
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([]);
  const [pageGroupOpen, setPageGroupOpen] = useState<Record<string, boolean>>({ Main: true });
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Build the iframe URL with edit flag + parent origin handshake
  const iframeSrc = useMemo(() => {
    const origin = window.location.origin;
    const url = new URL(currentPath, origin);
    url.searchParams.set("edit", "1");
    url.searchParams.set("editorOrigin", origin);
    return url.toString();
  }, [currentPath]);

  // Listen for messages from the iframe
  useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "ruvtier:edit:select" && data.payload) {
        setSelected(data.payload as EditableTarget);
      }
      if (data.type === "ruvtier:edit:ready") {
        // iframe is up — clear pending state
        setPendingPath(null);
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const navigateTo = useCallback((path: string) => {
    setSelected(null);
    setPendingPath(path);
    setCurrentPath(path);
  }, []);

  const reloadIframe = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage({ type: "ruvtier:edit:reload" }, window.location.origin);
  }, []);

  const groupedPages = useMemo(() => {
    const out: Record<string, typeof PAGES> = {};
    PAGES.forEach((p) => {
      out[p.group] = out[p.group] || [];
      out[p.group].push(p);
    });
    return out;
  }, []);

  // ========= Save logic =========
  const saveText = async (key: string, field: string, label: string, nextValue: string) => {
    setSaving(true);
    // Read existing
    const { data: existing } = await supabase
      .from("site_content" as any)
      .select("id, content_value, section")
      .eq("content_key", key)
      .maybeSingle();

    const previousValue = (existing as any)?.content_value?.[field] ?? null;
    const merged = { ...((existing as any)?.content_value || {}), [field]: nextValue };

    if (existing) {
      await (supabase.from("site_content" as any) as any)
        .update({ content_value: merged, updated_by: displayLabel })
        .eq("id", (existing as any).id);
    } else {
      await (supabase.from("site_content" as any) as any).insert({
        content_key: key,
        section: "editor_overrides",
        content_value: merged,
        updated_by: displayLabel,
      });
    }

    await (supabase.from("content_versions" as any) as any).insert({
      entity_type: "site_content",
      entity_id: key,
      entity_label: label,
      previous_value: { [field]: previousValue },
      new_value: { [field]: nextValue },
      changed_by: displayLabel,
    });

    setUndoStack((s) => [
      { contentKey: key, field, previousValue, nextValue, label, at: Date.now() },
      ...s,
    ].slice(0, 20));

    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
    reloadIframe();
  };

  const saveImage = async (key: string, label: string, url: string) => {
    setSaving(true);
    const { data: existing } = await supabase
      .from("site_content" as any)
      .select("id, content_value")
      .eq("content_key", key)
      .maybeSingle();

    const previousValue = (existing as any)?.content_value?.url ?? null;
    if (existing) {
      await (supabase.from("site_content" as any) as any)
        .update({ content_value: { url }, updated_by: displayLabel })
        .eq("id", (existing as any).id);
    } else {
      await (supabase.from("site_content" as any) as any).insert({
        content_key: key,
        section: "site_images",
        content_value: { url },
        updated_by: displayLabel,
      });
    }

    await (supabase.from("content_versions" as any) as any).insert({
      entity_type: "site_content",
      entity_id: key,
      entity_label: label,
      previous_value: { url: previousValue },
      new_value: { url },
      changed_by: displayLabel,
    });

    setUndoStack((s) => [
      { contentKey: key, field: "url", previousValue, nextValue: url, label, at: Date.now() },
      ...s,
    ].slice(0, 20));

    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
    reloadIframe();
  };

  const undoLast = async () => {
    const last = undoStack[0];
    if (!last) return;
    if (last.field === "url") {
      await saveImage(last.contentKey, last.label, last.previousValue ?? "");
    } else if (last.field) {
      await saveText(last.contentKey, last.field, last.label, last.previousValue ?? "");
    }
    setUndoStack((s) => s.slice(1));
  };

  // ========= Layout =========
  const vp = VIEWPORTS[viewport];

  return (
    <AdminLayout>
      <div className="mb-4 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
            Website Editor
          </h1>
          <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
            Open the live site and click any highlighted element to edit it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undoLast}
            disabled={undoStack.length === 0 || saving}
            className="flex items-center gap-2 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,75%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,30%)] disabled:opacity-30 disabled:cursor-not-allowed"
            style={fontStyle}
            title={undoStack[0] ? `Undo: ${undoStack[0].label}` : "Nothing to undo"}
          >
            <Undo2 size={12} /> Undo {undoStack.length > 0 && <span className="text-[hsl(220,10%,40%)]">({undoStack.length})</span>}
          </button>
          <a
            href={currentPath}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,75%)] border border-[hsl(220,10%,18%)] hover:border-[hsl(220,10%,30%)]"
            style={fontStyle}
          >
            <ExternalLink size={12} /> Open
          </a>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr_360px] gap-3 h-[calc(100vh-160px)] min-h-[640px]">
        {/* Page picker */}
        <aside className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] overflow-y-auto">
          <div className="px-3 py-3 border-b border-[hsl(220,10%,14%)] flex items-center gap-2">
            <Globe size={12} className="text-[hsl(220,10%,40%)]" />
            <span className="text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)]" style={fontStyle}>Pages</span>
          </div>
          {Object.entries(groupedPages).map(([group, pages]) => {
            const open = pageGroupOpen[group] !== false;
            return (
              <div key={group}>
                <button
                  onClick={() => setPageGroupOpen((p) => ({ ...p, [group]: !open }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-[10px] tracking-[0.14em] uppercase text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)]"
                  style={fontStyle}
                >
                  {group}
                  <ChevronRight size={10} className={`transition-transform ${open ? "rotate-90" : ""}`} />
                </button>
                {open && (
                  <ul>
                    {pages.map((p) => {
                      const active = p.path === currentPath;
                      return (
                        <li key={p.path}>
                          <button
                            onClick={() => navigateTo(p.path)}
                            className={`w-full text-left px-4 py-1.5 text-[11px] truncate ${
                              active
                                ? "text-[hsl(220,10%,90%)] bg-[hsl(220,15%,12%)]"
                                : "text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,80%)] hover:bg-[hsl(220,15%,11%)]"
                            }`}
                            style={fontStyle}
                            title={p.path}
                          >
                            {p.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </aside>

        {/* Live preview */}
        <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] flex flex-col min-w-0">
          <div className="h-10 px-3 flex items-center justify-between border-b border-[hsl(220,10%,14%)] gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[hsl(220,10%,55%)] truncate" style={fontStyle}>
              <span className="text-[hsl(220,10%,35%)]">ruvtier.com</span>
              <span className="text-[hsl(220,10%,80%)] truncate">{currentPath}</span>
              {pendingPath && <Loader2 size={11} className="animate-spin text-[hsl(220,10%,40%)] ml-1" />}
              {savedFlash && <span className="ml-2 text-[hsl(140,50%,55%)] tracking-[0.1em] uppercase text-[10px]">Saved</span>}
            </div>
            <div className="flex items-center gap-1">
              {(Object.entries(VIEWPORTS) as [ViewportKey, typeof VIEWPORTS[ViewportKey]][]).map(([k, def]) => {
                const Icon = def.icon;
                return (
                  <button
                    key={k}
                    onClick={() => setViewport(k)}
                    className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors ${
                      viewport === k ? "bg-[hsl(220,15%,12%)] text-[hsl(220,10%,85%)]" : "text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]"
                    }`}
                    title={def.label}
                  >
                    <Icon size={13} />
                  </button>
                );
              })}
              <button
                onClick={reloadIframe}
                className="w-7 h-7 flex items-center justify-center text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)]"
                title="Reload preview"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-[hsl(220,15%,5%)] flex items-center justify-center p-4">
            <div
              className="bg-white shadow-2xl shadow-black/40 transition-all duration-300"
              style={{
                width: typeof vp.width === "number" ? `${vp.width}px` : "100%",
                height: typeof vp.height === "number" ? `${vp.height}px` : "100%",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              <iframe
                ref={iframeRef}
                src={iframeSrc}
                title="Website preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              />
            </div>
          </div>
        </section>

        {/* Side panel */}
        <aside className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] overflow-y-auto">
          {selected ? (
            <SidePanel
              key={`${selected.kind}-${selected.key}-${selected.field}`}
              target={selected}
              onClose={() => setSelected(null)}
              saving={saving}
              onSaveText={saveText}
              onSaveImage={saveImage}
            />
          ) : (
            <EmptyHelp />
          )}
        </aside>
      </div>
    </AdminLayout>
  );
}

// ========= Empty help =========
function EmptyHelp() {
  return (
    <div className="p-5 text-[12px] text-[hsl(220,10%,55%)] leading-[1.7]" style={fontStyle}>
      <p className="text-[hsl(220,10%,80%)] mb-3 text-[13px]">No element selected</p>
      <p className="mb-3">
        Move the cursor over the preview on the left. Editable elements show a thin gold dashed outline.
        Click any of them to open its form here.
      </p>
      <ul className="space-y-1.5 text-[11px] text-[hsl(220,10%,45%)]">
        <li>· Headlines & body copy</li>
        <li>· Site images (hero, backgrounds)</li>
        <li>· Footer links & contact details</li>
      </ul>
      <p className="mt-4 text-[11px] text-[hsl(220,10%,40%)]">
        Tip: changes are saved instantly and a session-undo stack keeps the last 20 edits.
      </p>
    </div>
  );
}

// ========= Side panel =========
interface SidePanelProps {
  target: EditableTarget;
  onClose: () => void;
  saving: boolean;
  onSaveText: (key: string, field: string, label: string, value: string) => Promise<void>;
  onSaveImage: (key: string, label: string, url: string) => Promise<void>;
}

function SidePanel({ target, onClose, saving, onSaveText, onSaveImage }: SidePanelProps) {
  const [textValue, setTextValue] = useState<string>("");
  const [loadedInitial, setLoadedInitial] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    let active = true;
    setLoadedInitial(false);
    if (!target.key) return;
    supabase
      .from("site_content" as any)
      .select("content_value")
      .eq("content_key", target.key)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const v = (data as any)?.content_value || {};
        if (target.kind === "site_image" || target.field === "url") {
          setImageUrl(v.url || "");
        } else if (target.field) {
          setTextValue(v[target.field] || "");
        }
        setLoadedInitial(true);
      });
    return () => { active = false; };
  }, [target.key, target.field, target.kind]);

  const Icon = target.kind === "site_image" ? ImageIcon : Type;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[hsl(220,10%,14%)] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={13} className="text-[hsl(220,10%,45%)] shrink-0" />
          <div className="min-w-0">
            <p className="text-[12px] text-[hsl(220,10%,80%)] truncate" style={fontStyle}>
              {target.label || target.key || "Untitled"}
            </p>
            <p className="text-[10px] text-[hsl(220,10%,35%)] tracking-[0.1em] uppercase truncate" style={fontStyle}>
              {target.kind.replace("_", " ")} · {target.path}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,70%)] shrink-0">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!loadedInitial ? (
          <div className="flex items-center gap-2 text-[11px] text-[hsl(220,10%,45%)]" style={fontStyle}>
            <Loader2 size={12} className="animate-spin" /> Loading current value…
          </div>
        ) : target.kind === "text_block" && target.field ? (
          <div>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5" style={fontStyle}>
              {target.field}
            </label>
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,85%)] text-[13px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
              style={fontStyle}
            />
            <p className="mt-1.5 text-[10px] text-[hsl(220,10%,35%)]" style={fontStyle}>
              Saves to site_content · key <span className="text-[hsl(220,10%,55%)]">{target.key}</span>
            </p>
          </div>
        ) : target.kind === "site_image" && target.key ? (
          <ImageUpload
            label="Image"
            value={imageUrl}
            onChange={setImageUrl}
            bucket="site-images"
            folder={target.key}
            aspectRatio={16 / 9}
          />
        ) : (
          <p className="text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>
            This element type is not yet editable from the inline editor. Use the matching admin section instead.
          </p>
        )}
      </div>

      {(target.kind === "text_block" && target.field) || target.kind === "site_image" ? (
        <div className="border-t border-[hsl(220,10%,14%)] p-3 flex items-center gap-2">
          <button
            disabled={saving || !target.key}
            onClick={() =>
              target.kind === "site_image"
                ? onSaveImage(target.key!, target.label || target.key!, imageUrl)
                : onSaveText(target.key!, target.field!, target.label || target.key!, textValue)
            }
            className="flex-1 flex items-center justify-center gap-2 h-9 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? "Saving" : "Save"}
          </button>
          <button
            onClick={onClose}
            className="h-9 px-4 text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,80%)]"
            style={fontStyle}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
