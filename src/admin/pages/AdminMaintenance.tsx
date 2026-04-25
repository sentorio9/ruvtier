import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Power, Save, Eye, Mail, AlertTriangle } from "lucide-react";

interface Settings {
  maintenance_enabled: boolean;
  maintenance_headline: string;
  maintenance_subline: string;
  maintenance_collect_email: boolean;
  maintenance_started_at: string | null;
  updated_at: string;
  updated_by: string | null;
}

interface Subscriber {
  id: string;
  email: string;
  notified_at: string | null;
  created_at: string;
}

const fontStyle = { fontFamily: "var(--font-sans)" };
const inputClass =
  "w-full h-9 px-3 bg-[hsl(220,15%,12%)] border border-[hsl(220,10%,18%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors";

export default function AdminMaintenance() {
  const { displayLabel } = useAdminAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: subs }] = await Promise.all([
        (supabase.from("site_settings" as any) as any).select("*").eq("id", 1).maybeSingle(),
        (supabase.from("maintenance_subscribers" as any) as any)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200),
      ]);
      setSettings(s);
      setSubscribers((subs as any) || []);
      setLoading(false);
    })();
  }, []);

  const toggleMaintenance = async () => {
    if (!settings) return;
    setToggling(true);
    const next = !settings.maintenance_enabled;
    const update: any = {
      maintenance_enabled: next,
      updated_by: displayLabel,
    };
    if (next) update.maintenance_started_at = new Date().toISOString();

    await (supabase.from("site_settings" as any) as any).update(update).eq("id", 1);

    await supabase.from("audit_logs").insert({
      action: next ? "maintenance_enabled" : "maintenance_disabled",
      actor_email: displayLabel,
      target_type: "site_settings",
      target_id: "maintenance",
    });

    setSettings({ ...settings, ...update });
    setToggling(false);
    setConfirmToggle(false);
  };

  const handleSaveCopy = async () => {
    if (!settings) return;
    setSaving(true);
    await (supabase.from("site_settings" as any) as any)
      .update({
        maintenance_headline: settings.maintenance_headline,
        maintenance_subline: settings.maintenance_subline,
        maintenance_collect_email: settings.maintenance_collect_email,
        updated_by: displayLabel,
      })
      .eq("id", 1);

    await supabase.from("audit_logs").insert({
      action: "maintenance_copy_updated",
      actor_email: displayLabel,
      target_type: "site_settings",
      target_id: "maintenance",
    });

    setSaving(false);
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  const exportSubscribersCsv = () => {
    const rows = [
      ["email", "subscribed_at", "notified_at"],
      ...subscribers.map((s) => [s.email, s.created_at, s.notified_at || ""]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `maintenance-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      </AdminLayout>
    );
  }

  const isOn = settings.maintenance_enabled;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
          Maintenance
        </h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
          Take the live website offline. Visitors see a holding page while you work.
        </p>
      </div>

      {/* Status / toggle card */}
      <div
        className={`max-w-[900px] border p-6 mb-6 transition-colors ${
          isOn
            ? "bg-[hsl(15,40%,10%)] border-[hsl(15,40%,25%)]"
            : "bg-[hsl(220,15%,9%)] border-[hsl(220,10%,14%)]"
        }`}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isOn ? "bg-[hsl(15,70%,55%)] animate-pulse" : "bg-[hsl(140,40%,45%)]"
                }`}
              />
              <span
                className="text-[10px] tracking-[0.18em] uppercase"
                style={{ ...fontStyle, color: isOn ? "hsl(15,70%,65%)" : "hsl(140,40%,60%)" }}
              >
                {isOn ? "Maintenance is ON — site is offline" : "Site is live"}
              </span>
            </div>
            <p className="text-[13px] text-[hsl(220,10%,75%)] leading-[1.7]" style={fontStyle}>
              {isOn
                ? "All public routes are returning the holding page. Admins are unaffected."
                : "Visitors can browse normally. Turning maintenance on hides every public route immediately."}
            </p>
            {isOn && settings.maintenance_started_at && (
              <p className="text-[11px] text-[hsl(220,10%,45%)] mt-2" style={fontStyle}>
                Offline since {new Date(settings.maintenance_started_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {!confirmToggle ? (
              <button
                onClick={() => setConfirmToggle(true)}
                className={`flex items-center gap-2 h-9 px-5 text-[11px] tracking-[0.12em] uppercase transition-colors ${
                  isOn
                    ? "bg-[hsl(140,40%,40%)] text-[hsl(220,15%,8%)] hover:bg-[hsl(140,40%,50%)]"
                    : "bg-[hsl(15,60%,45%)] text-[hsl(220,15%,8%)] hover:bg-[hsl(15,60%,55%)]"
                }`}
                style={fontStyle}
              >
                <Power size={13} />
                {isOn ? "Bring site back online" : "Take site offline"}
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <p className="text-[11px] text-[hsl(220,10%,70%)] flex items-center gap-2" style={fontStyle}>
                  <AlertTriangle size={12} className="text-[hsl(40,80%,60%)]" />
                  {isOn ? "Restore the public site?" : "Hide the entire public site?"}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={toggleMaintenance}
                    disabled={toggling}
                    className="h-8 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.12em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
                    style={fontStyle}
                  >
                    {toggling ? "..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setConfirmToggle(false)}
                    className="h-8 px-4 text-[11px] tracking-[0.12em] uppercase text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,80%)] transition-colors"
                    style={fontStyle}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {isOn && (
              <a
                href="/?preview=1"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase text-[hsl(220,10%,50%)] hover:text-[hsl(220,10%,80%)] transition-colors"
                style={fontStyle}
              >
                <Eye size={11} /> Preview live site
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Holding page copy editor */}
      <div className="max-w-[900px] bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-6 mb-6">
        <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,75%)] mb-4" style={fontStyle}>
          Holding page
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5" style={fontStyle}>
              Headline
            </label>
            <input
              value={settings.maintenance_headline}
              onChange={(e) => setSettings({ ...settings, maintenance_headline: e.target.value })}
              className={inputClass}
              style={fontStyle}
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] mb-1.5" style={fontStyle}>
              Subline
            </label>
            <textarea
              value={settings.maintenance_subline}
              onChange={(e) => setSettings({ ...settings, maintenance_subline: e.target.value })}
              rows={3}
              className={`${inputClass} h-auto py-2`}
              style={fontStyle}
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={settings.maintenance_collect_email}
              onChange={(e) => setSettings({ ...settings, maintenance_collect_email: e.target.checked })}
              className="w-4 h-4 accent-[hsl(220,10%,80%)]"
            />
            <span className="text-[12px] text-[hsl(220,10%,70%)]" style={fontStyle}>
              Show email-capture field on the holding page
            </span>
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSaveCopy}
              disabled={saving}
              className="flex items-center gap-2 h-8 px-4 bg-[hsl(220,10%,85%)] text-[hsl(220,15%,8%)] text-[11px] tracking-[0.1em] uppercase hover:bg-[hsl(220,10%,75%)] transition-colors disabled:opacity-40"
              style={fontStyle}
            >
              <Save size={12} /> {saving ? "Saving..." : "Save copy"}
            </button>
            {savedAt && (
              <span className="text-[10px] text-[hsl(140,50%,55%)] tracking-[0.1em] uppercase" style={fontStyle}>
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subscribers list */}
      <div className="max-w-[900px] bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-[hsl(220,10%,40%)]" />
            <h2 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,75%)]" style={fontStyle}>
              Notify list
            </h2>
            <span className="text-[11px] text-[hsl(220,10%,40%)]" style={fontStyle}>
              {subscribers.length} {subscribers.length === 1 ? "person" : "people"}
            </span>
          </div>
          {subscribers.length > 0 && (
            <button
              onClick={exportSubscribersCsv}
              className="text-[10px] tracking-[0.14em] uppercase text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,85%)] transition-colors"
              style={fontStyle}
            >
              Export CSV
            </button>
          )}
        </div>
        {subscribers.length === 0 ? (
          <p className="text-[12px] text-[hsl(220,10%,40%)] py-6 text-center" style={fontStyle}>
            No one has subscribed yet. When maintenance is on, visitor emails appear here.
          </p>
        ) : (
          <div className="max-h-[360px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[hsl(220,10%,14%)]">
                  <th className="text-left py-2 pr-4 text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] font-normal" style={fontStyle}>Email</th>
                  <th className="text-left py-2 pr-4 text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] font-normal" style={fontStyle}>Subscribed</th>
                  <th className="text-left py-2 text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] font-normal" style={fontStyle}>Notified</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-[hsl(220,10%,12%)]">
                    <td className="py-2 pr-4 text-[hsl(220,10%,80%)]" style={fontStyle}>{s.email}</td>
                    <td className="py-2 pr-4 text-[hsl(220,10%,55%)]" style={fontStyle}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-[hsl(220,10%,55%)]" style={fontStyle}>
                      {s.notified_at ? new Date(s.notified_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
