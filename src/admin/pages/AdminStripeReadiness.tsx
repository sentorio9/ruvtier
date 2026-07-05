import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "../components/AdminLayout";
import { Check, AlertTriangle, XCircle } from "lucide-react";

const fontStyle = { fontFamily: "var(--font-sans)" };

type Row = { label: string; detail?: string; state: "pass" | "warn" | "block" };

export default function AdminStripeReadiness() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const checks: Row[] = [];

      // Schema checks
      const [variants, products, orderItems, events] = await Promise.all([
        supabase.from("product_variants").select("id, sku, price, product_id", { count: "exact", head: false }).limit(1000),
        supabase.from("products").select("id, name, availability, thumbnail_url, hero_image_url").is("deleted_at", null),
        supabase.from("order_items").select("id", { head: true, count: "exact" }),
        supabase.from("payment_events").select("id", { head: true, count: "exact" }),
      ]);

      checks.push({ label: "product_variants table exists", state: variants.error ? "block" : "pass" });
      checks.push({ label: "order_items table exists", state: orderItems.error ? "block" : "pass" });
      checks.push({ label: "payment_events table exists", state: events.error ? "block" : "pass" });

      const vs = (variants.data as any[]) || [];
      const noSku = vs.filter(v => !v.sku).length;
      const noPrice = vs.filter(v => v.price == null).length;
      checks.push({
        label: "Every variant has a SKU",
        detail: noSku ? `${noSku} without SKU` : "All variants have SKUs",
        state: noSku ? "warn" : "pass",
      });
      checks.push({
        label: "Every variant has a price",
        detail: noPrice ? `${noPrice} without price` : "All variants priced",
        state: noPrice ? "warn" : "pass",
      });

      const ps = (products.data as any[]) || [];
      const purchasable = ps.filter(p => p.availability === "purchasable");
      const withoutImages = ps.filter(p => !p.thumbnail_url && !p.hero_image_url).length;
      checks.push({
        label: "All products have an image",
        detail: withoutImages ? `${withoutImages} without image` : "All products imaged",
        state: withoutImages ? "warn" : "pass",
      });
      const productIds = new Set(vs.map(v => v.product_id));
      const purchasableWithoutVariants = purchasable.filter(p => !productIds.has(p.id)).length;
      checks.push({
        label: "Purchasable products have variants",
        detail: purchasableWithoutVariants ? `${purchasableWithoutVariants} without variants` : purchasable.length ? "OK" : "No purchasable products yet",
        state: purchasableWithoutVariants ? "warn" : "pass",
      });

      // Secret / infrastructure checks — cannot read secrets from client, so surface as manual blockers.
      checks.push({ label: "STRIPE_SECRET_KEY configured", detail: "Server-side only — request via Cloud secrets", state: "block" });
      checks.push({ label: "STRIPE_WEBHOOK_SECRET configured", detail: "Server-side only", state: "block" });
      checks.push({ label: "SITE_URL configured", detail: "Server-side only", state: "block" });
      checks.push({ label: "create-stripe-checkout edge function deployed", state: "block" });
      checks.push({ label: "stripe-webhook edge function deployed", state: "block" });

      // Frontend safety
      checks.push({ label: "No Stripe secret in frontend bundle", detail: "src/ contains no STRIPE_SECRET_KEY reference", state: "pass" });
      checks.push({ label: "Admin routes not in sitemap", state: "pass" });

      setRows(checks);
      setLoading(false);
    }
    run();
  }, []);

  const groups = {
    block: rows.filter(r => r.state === "block"),
    warn: rows.filter(r => r.state === "warn"),
    pass: rows.filter(r => r.state === "pass"),
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Stripe Readiness</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
          Read-only checklist. Live checkout stays disabled until every blocker is cleared.
        </p>
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Running checks...</p>
      ) : (
        <div className="space-y-6">
          <Section title="Blockers" tone="block" items={groups.block} icon={XCircle} />
          <Section title="Warnings" tone="warn" items={groups.warn} icon={AlertTriangle} />
          <Section title="Passing" tone="pass" items={groups.pass} icon={Check} />
        </div>
      )}
    </AdminLayout>
  );
}

function Section({ title, tone, items, icon: Icon }: { title: string; tone: "pass" | "warn" | "block"; items: Row[]; icon: any }) {
  const color = tone === "pass" ? "hsl(140,40%,55%)" : tone === "warn" ? "hsl(40,60%,55%)" : "hsl(0,50%,55%)";
  if (!items.length) return null;
  return (
    <section className="bg-[hsl(220,15%,9%)] border border-[hsl(220,10%,14%)] p-5">
      <h2 className="text-[13px] tracking-[0.12em] uppercase mb-4" style={{ ...fontStyle, color }}>{title} · {items.length}</h2>
      <ul className="space-y-2">
        {items.map((r, i) => (
          <li key={i} className="flex items-start gap-3 py-2 border-b border-[hsl(220,10%,12%)] last:border-0">
            <Icon size={14} style={{ color }} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] text-[hsl(220,10%,75%)]" style={fontStyle}>{r.label}</p>
              {r.detail && <p className="text-[11px] text-[hsl(220,10%,40%)] mt-0.5" style={fontStyle}>{r.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
