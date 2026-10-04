import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function DeleteAccountSection({ onDeleted }: { onDeleted: () => void }) {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("delete-account", { body: { confirm: "DELETE" } });
    setBusy(false);
    if (error || !data?.ok) {
      setError(
        data?.error === "staff_account"
          ? "House staff accounts are closed by an administrator."
          : "We could not close your account. Please contact the concierge."
      );
      return;
    }
    await signOut();
    onDeleted();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full h-11 text-[10px] tracking-[0.15em] uppercase text-muted-foreground/70 hover:text-foreground transition-colors font-sans"
      >
        Delete Account
      </button>
    );
  }

  return (
    <div className="border-t border-border pt-5 space-y-4">
      <p className="font-sans text-[12px] leading-relaxed text-muted-foreground">
        Closing your account permanently removes your profile, addresses, saved selections and any allocation or
        appointment requests. Order records are kept only as long as the law requires. This cannot be undone.
      </p>
      <label className="block">
        <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Type DELETE to confirm</span>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          name="delete-confirm"
          autoComplete="off"
          className="mt-2 w-full h-11 bg-transparent border-b border-border font-sans text-[13px] text-foreground focus:outline-none"
        />
      </label>
      {error && <p className="font-sans text-[12px] text-destructive">{error}</p>}
      <div className="flex gap-3">
        <button
          onClick={() => { setOpen(false); setTyped(""); setError(null); }}
          className="flex-1 h-11 text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors font-sans"
        >
          Keep Account
        </button>
        <button
          onClick={handleDelete}
          disabled={typed !== "DELETE" || busy}
          className="flex-1 h-11 border border-border text-[11px] tracking-[0.15em] uppercase text-foreground hover:bg-accent transition-colors font-sans disabled:opacity-40"
        >
          {busy ? "Closing…" : "Delete Permanently"}
        </button>
      </div>
    </div>
  );
}
