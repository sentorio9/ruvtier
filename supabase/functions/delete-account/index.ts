import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json({ error: "unauthorised" }, 401);

  const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user }, error: uErr } = await userClient.auth.getUser();
  if (uErr || !user) return json({ error: "unauthorised" }, 401);

  let body: { confirm?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  if (body.confirm !== "DELETE") return json({ error: "confirmation_required" }, 400);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Staff accounts must be removed by a super admin, not self-service.
  const { data: roles } = await admin.from("user_roles").select("id").eq("user_id", user.id);
  if (roles && roles.length > 0) return json({ error: "staff_account" }, 403);

  const uid = user.id;
  const email = (user.email ?? "").toLowerCase();

  try {
    await admin.from("carts").delete().eq("user_id", uid);
    await admin.from("preorder_requests").delete().eq("user_id", uid);
    await admin.from("appointment_requests").delete().eq("user_id", uid);
    if (email) {
      await admin.from("preorder_requests").delete().ilike("email", email);
      await admin.from("appointment_requests").delete().ilike("email", email);
      await admin.from("maintenance_subscribers").delete().ilike("email", email);
    }
    // Orders are retained for statutory accounting; the customer record is anonymised.
    await admin.from("customers").update({
      user_id: null, name: null, phone: null, internal_notes: null,
      email: `deleted-${uid}@deleted.invalid`, status: "deleted", deleted_at: new Date().toISOString(),
    }).eq("user_id", uid);
    await admin.from("profiles").delete().eq("user_id", uid);

    const { error: dErr } = await admin.auth.admin.deleteUser(uid);
    if (dErr) throw dErr;

    await admin.from("audit_logs").insert({
      action: "account_self_deleted", target_type: "user", target_id: uid,
    });
    return json({ ok: true });
  } catch (e) {
    console.error("delete-account failed", e);
    return json({ error: "deletion_failed" }, 500);
  }
});
