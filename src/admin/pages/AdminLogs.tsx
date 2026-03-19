import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { Search, Activity } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type AuditLog = Tables<"audit_logs">;

export default function AdminLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100);
      if (search) q = q.or(`action.ilike.%${search}%,actor_email.ilike.%${search}%`);
      const { data } = await q;
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, [search]);

  const fontStyle = { fontFamily: "var(--font-sans)" };

  const actionColors: Record<string, string> = {
    admin_login_success: "text-[hsl(140,45%,50%)]",
    admin_login_failed: "text-[hsl(0,50%,55%)]",
    admin_login_unauthorized: "text-[hsl(0,50%,55%)]",
    product_created: "text-[hsl(200,50%,55%)]",
    product_updated: "text-[hsl(40,60%,55%)]",
    product_archived: "text-[hsl(40,60%,55%)]",
    product_deleted: "text-[hsl(0,50%,55%)]",
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Audit Logs</h1>
      </div>

      <div className="relative max-w-[300px] mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search logs..."
          className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
          style={fontStyle}
        />
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>No logs recorded</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-4 py-3 bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,12%)] hover:border-[hsl(220,10%,18%)] transition-colors">
              <Activity size={12} className="text-[hsl(220,10%,25%)] flex-shrink-0" />
              <span className={`text-[12px] tracking-[0.05em] min-w-[180px] ${actionColors[log.action] || "text-[hsl(220,10%,55%)]"}`} style={fontStyle}>
                {log.action.replace(/_/g, " ")}
              </span>
              <span className="text-[11px] text-[hsl(220,10%,40%)] flex-1" style={fontStyle}>
                {log.actor_email || "system"}
              </span>
              <span className="text-[10px] text-[hsl(220,10%,28%)] flex-shrink-0" style={fontStyle}>
                {new Date(log.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
