import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Search, ChevronDown } from "lucide-react";

interface AppointmentRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  appointment_type: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(210,60%,55%)",
  confirmed: "hsl(140,50%,45%)",
  completed: "hsl(270,40%,55%)",
  cancelled: "hsl(0,50%,55%)",
};

const TYPE_LABELS: Record<string, string> = {
  private_consultation: "Private consultation",
  made_to_measure: "Made-to-measure",
  collection_viewing: "Collection viewing",
  client_services: "Client services",
  house_visit: "Visit the House",
};

export default function AdminAppointments() {
  const { displayLabel } = useAdminAuth();
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fontStyle = { fontFamily: "var(--font-sans)" };

  const fetchRequests = async () => {
    let query = supabase.from("appointment_requests" as any).select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data } = await query;
    setRequests((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [search, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("appointment_requests" as any).update({ status: newStatus } as any).eq("id", id);
    await supabase.from("audit_logs").insert({
      action: "appointment_status_updated",
      actor_email: displayLabel,
      target_type: "appointment_request",
      target_id: id,
      details: { new_status: newStatus },
    });
    fetchRequests();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
          Appointment Requests
        </h1>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)] transition-colors"
            style={fontStyle}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[12px] focus:outline-none"
          style={fontStyle}
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="text-[hsl(220,10%,50%)] text-[12px]" style={fontStyle}>Loading…</p>
      ) : requests.length === 0 ? (
        <p className="text-[hsl(220,10%,50%)] text-[12px]" style={fontStyle}>No appointment requests yet.</p>
      ) : (
        <div className="border border-[hsl(220,10%,14%)]">
          {requests.map((r) => {
            const isOpen = expandedId === r.id;
            return (
              <div key={r.id} className="border-b border-[hsl(220,10%,14%)] last:border-b-0">
                <button
                  onClick={() => setExpandedId(isOpen ? null : r.id)}
                  className="w-full grid grid-cols-[1fr_1fr_140px_120px_100px_auto] gap-3 items-center text-left px-4 py-3 hover:bg-[hsl(220,15%,10%)] transition-colors"
                  style={fontStyle}
                >
                  <span className="text-[13px] text-[hsl(220,10%,85%)] truncate">{r.full_name}</span>
                  <span className="text-[12px] text-[hsl(220,10%,55%)] truncate">{r.email}</span>
                  <span className="text-[11px] text-[hsl(220,10%,55%)] truncate">{TYPE_LABELS[r.appointment_type] ?? r.appointment_type}</span>
                  <span className="text-[11px] text-[hsl(220,10%,55%)]">{r.preferred_date ?? "—"}{r.preferred_time ? ` · ${r.preferred_time}` : ""}</span>
                  <span
                    className="text-[10px] tracking-[0.12em] uppercase px-2 py-1"
                    style={{ backgroundColor: STATUS_COLORS[r.status] + "22", color: STATUS_COLORS[r.status] }}
                  >
                    {r.status}
                  </span>
                  <ChevronDown size={14} className={`text-[hsl(220,10%,40%)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 pt-1 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[hsl(220,15%,7%)]">
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[hsl(220,10%,45%)] mb-2" style={fontStyle}>Contact</p>
                      <p className="text-[12px] text-[hsl(220,10%,80%)]" style={fontStyle}>{r.full_name}</p>
                      <p className="text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{r.email}</p>
                      {r.phone && <p className="text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{r.phone}</p>}
                      <p className="text-[10px] text-[hsl(220,10%,40%)] mt-3" style={fontStyle}>
                        Received {new Date(r.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.15em] uppercase text-[hsl(220,10%,45%)] mb-2" style={fontStyle}>Message</p>
                      <p className="text-[12px] text-[hsl(220,10%,75%)] whitespace-pre-line" style={fontStyle}>
                        {r.message || "—"}
                      </p>
                    </div>
                    <div className="md:col-span-2 flex flex-wrap gap-2 pt-3 border-t border-[hsl(220,10%,14%)]">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(r.id, s)}
                          disabled={r.status === s}
                          className={`px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase transition-colors border ${
                            r.status === s
                              ? "border-[hsl(220,10%,30%)] text-[hsl(220,10%,80%)] bg-[hsl(220,15%,12%)]"
                              : "border-[hsl(220,10%,16%)] text-[hsl(220,10%,50%)] hover:border-[hsl(220,10%,30%)] hover:text-[hsl(220,10%,80%)]"
                          }`}
                          style={fontStyle}
                        >
                          {s}
                        </button>
                      ))}
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
