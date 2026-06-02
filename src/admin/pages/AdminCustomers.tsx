import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import ConfirmModal from "../components/ConfirmModal";
import { Search, Save, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Customer = Tables<"customers">;

const statuses = ["active", "vip", "blocked", "archived"];

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);
  const fontStyle = { fontFamily: "var(--font-sans)" };

  const load = async () => {
    setLoading(true);
    let query = supabase.from("customers").select("*").is("deleted_at", null).order("created_at", { ascending: false });
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    setCustomers(data || []);
    setEditingNotes(Object.fromEntries((data || []).map((customer) => [customer.id, customer.internal_notes || ""])));
    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 180);
    return () => window.clearTimeout(timer);
  }, [search]);

  const updateCustomer = async (customer: Customer, patch: Partial<Customer>) => {
    setBusyId(customer.id);
    const { error } = await supabase
      .from("customers")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", customer.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Customer updated");
      await load();
    }
    setBusyId(null);
  };

  const archiveCustomer = async (customer: Customer) => {
    await updateCustomer(customer, {
      status: "archived",
      deleted_at: new Date().toISOString(),
    } as Partial<Customer>);
    setPendingDelete(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Customers</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>View accounts, update status, and keep internal notes</p>
      </div>

      <div className="relative max-w-[340px] mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,35%)]" />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customers..."
          className="w-full h-9 pl-9 pr-3 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,75%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
          style={fontStyle}
        />
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading...</p>
      ) : customers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>No customers yet</p>
        </div>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-[hsl(220,10%,14%)] bg-[hsl(220,15%,8%)]">
                {["Name", "Email", "Orders", "Total Spend", "Status", "Internal Notes", "Actions"].map((heading) => (
                  <th key={heading} className="text-left text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,40%)] px-4 py-3 font-normal" style={fontStyle}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-[hsl(220,10%,10%)] hover:bg-[hsl(220,15%,9%)] align-top">
                  <td className="px-4 py-3 text-[13px] text-[hsl(220,10%,75%)]" style={fontStyle}>{customer.name || "-"}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,55%)]" style={fontStyle}>{customer.email}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>{customer.order_count ?? 0}</td>
                  <td className="px-4 py-3 text-[12px] text-[hsl(220,10%,60%)]" style={fontStyle}>€{Number(customer.total_spend ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select
                      value={customer.status || "active"}
                      disabled={busyId === customer.id}
                      onChange={(event) => updateCustomer(customer, { status: event.target.value } as Partial<Customer>)}
                      className="h-8 bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)] px-2 text-[11px] tracking-[0.1em] uppercase text-[hsl(140,45%,50%)] focus:outline-none"
                      style={fontStyle}
                    >
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 min-w-[280px]">
                    <textarea
                      value={editingNotes[customer.id] ?? ""}
                      onChange={(event) => setEditingNotes((prev) => ({ ...prev, [customer.id]: event.target.value }))}
                      rows={2}
                      maxLength={500}
                      className="w-full px-3 py-2 bg-[hsl(220,15%,8%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,70%)] text-[12px] focus:outline-none focus:border-[hsl(220,10%,30%)]"
                      style={fontStyle}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCustomer(customer, { internal_notes: editingNotes[customer.id] || null } as Partial<Customer>)}
                        disabled={busyId === customer.id}
                        title="Save notes"
                        className="text-[hsl(220,10%,35%)] hover:text-[hsl(220,10%,75%)] transition-colors disabled:opacity-30"
                      >
                        <Save size={14} />
                      </button>
                      <button
                        onClick={() => setPendingDelete(customer)}
                        disabled={busyId === customer.id}
                        title="Archive customer"
                        className="text-[hsl(220,10%,35%)] hover:text-[hsl(0,50%,55%)] transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Archive ${pendingDelete?.email ?? "customer"}?`}
        description="This hides the customer from operational lists without deleting authentication data."
        confirmLabel="Archive customer"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && archiveCustomer(pendingDelete)}
      />
    </AdminLayout>
  );
}
