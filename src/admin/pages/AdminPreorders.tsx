import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Search, ChevronDown } from "lucide-react";

interface PreorderRequest {
  id: string;
  product_name: string;
  full_name: string;
  email: string;
  country: string | null;
  size_preference: string | null;
  delivery_region: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

const STATUSES = ["new", "reviewed", "approved", "declined", "contacted"];
const STATUS_COLORS: Record<string, string> = {
  new: "hsl(210,60%,55%)",
  reviewed: "hsl(40,60%,55%)",
  approved: "hsl(140,50%,45%)",
  declined: "hsl(0,50%,55%)",
  contacted: "hsl(270,40%,55%)",
};

export default function AdminPreorders() {
  const { displayLabel } = useAdminAuth();
  const [requests, setRequests] = useState<PreorderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fontStyle = { fontFamily: "var(--font-sans)" };
  const fetchRequests = async () => {
    let query = supabase.from("preorder_requests" as any).select("*").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,product_name.ilike.%${search}%`);
    const { data } = await query;
    setRequests((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [search, statusFilter]);

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from("preorder_requests" as any).update({ status: newStatus } as any).eq("id", id);
    await supabase.from("audit_logs").insert({
      action: "preorder_status_updated",
      actor_email: displayLabel,
      target_type: "preorder_request",
      target_id: id,
      details: { new_status: newStatus },
    });
    fetchRequests();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>
          Preorder Requests
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, product..."
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>No preorder requests found.</p>
      ) : (
        <div className="space-y-2">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] transition-colors"
            >
              {/* Row */}
              <button
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="w-full flex items-center gap-4 px-4 py-3 text-left"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[req.status] || "hsl(220,10%,40%)" }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] text-[hsl(220,10%,80%)] truncate block" style={fontStyle}>
                    {req.full_name}
                  </span>
                </div>
                <span className="text-[11px] text-[hsl(220,10%,50%)] truncate max-w-[160px]" style={fontStyle}>
                  {req.product_name}
                </span>
                <span className="text-[10px] text-[hsl(220,10%,35%)] w-[80px] text-right" style={fontStyle}>
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
                <span
                  className="text-[10px] tracking-[0.1em] uppercase w-[70px] text-right"
                  style={{ fontFamily: "var(--font-sans)", color: STATUS_COLORS[req.status] }}
                >
                  {req.status}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-[hsl(220,10%,35%)] transition-transform ${expandedId === req.id ? "rotate-180" : ""}`}
                />
              </button>

              {/* Expanded details */}
              {expandedId === req.id && (
                <div className="px-4 pb-4 pt-1 border-t border-[hsl(220,10%,14%)]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <Detail label="Email" value={req.email} />
                    <Detail label="Country" value={req.country} />
                    <Detail label="Size" value={req.size_preference} />
                    <Detail label="Delivery region" value={req.delivery_region} />
                    <Detail label="Product" value={req.product_name} />
                    <Detail label="Submitted" value={new Date(req.created_at).toLocaleString()} />
                  </div>
                  {req.message && (
                    <div className="mb-4">
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] mb-1" style={fontStyle}>Message</p>
                      <p className="text-[12px] text-[hsl(220,10%,65%)] leading-relaxed" style={fontStyle}>{req.message}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {STATUSES.filter((s) => s !== req.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(req.id, s)}
                        className="h-7 px-3 text-[10px] tracking-[0.1em] uppercase border border-[hsl(220,10%,20%)] text-[hsl(220,10%,55%)] hover:text-[hsl(220,10%,80%)] hover:border-[hsl(220,10%,35%)] transition-colors"
                        style={fontStyle}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] mb-0.5" style={{ fontFamily: "var(--font-sans)" }}>{label}</p>
      <p className="text-[12px] text-[hsl(220,10%,70%)]" style={{ fontFamily: "var(--font-sans)" }}>{value || "—"}</p>
    </div>
  );
}
