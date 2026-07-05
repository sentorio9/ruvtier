import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, RefreshCcw } from "lucide-react";

type Variant = {
  id: string;
  product_id: string;
  size: string | null;
  colour: string | null;
  sku: string | null;
  price: number | null;
  stock_quantity: number;
  available_quantity: number | null;
  status: string;
};

interface Props {
  productId: string;
  productName: string;
  collection: string | null;
  sizes: string[];
  colours: string[];
}

const fontStyle = { fontFamily: "var(--font-sans)" };

function suggestSku(collection: string | null, colour: string, size: string, productName: string) {
  const c = (collection || productName).replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "RUV";
  const col = (colour || "").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "STD";
  const sz = (size || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "OS";
  return `RUV-${c}-${col}-${sz}`;
}

export default function VariantMatrix({ productId, productName, collection, sizes, colours }: Props) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("product_variants")
      .select("id, product_id, size, colour, sku, price, stock_quantity, available_quantity, status")
      .eq("product_id", productId)
      .order("size", { ascending: true });
    if (error) toast.error(error.message);
    setVariants((data as any) || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const getCell = (size: string, colour: string) =>
    variants.find(v => (v.size || "") === size && (v.colour || "") === colour);

  const generateMissing = async () => {
    if (!sizes.length || !colours.length) {
      toast.error("Add sizes and colours to the product first.");
      return;
    }
    setBusy(true);
    const rows = [];
    for (const size of sizes) {
      for (const colour of colours) {
        if (getCell(size, colour)) continue;
        rows.push({
          product_id: productId,
          size,
          colour,
          sku: suggestSku(collection, colour, size, productName),
          stock_quantity: 0,
          status: "active",
        });
      }
    }
    if (!rows.length) { toast.info("All variants already exist."); setBusy(false); return; }
    const { error } = await supabase.from("product_variants").insert(rows as any);
    if (error) toast.error(error.message);
    else toast.success(`Added ${rows.length} variant${rows.length > 1 ? "s" : ""}`);
    setBusy(false);
    load();
  };

  const updateCell = async (id: string, patch: Partial<Variant>) => {
    const { error } = await supabase.from("product_variants").update(patch as any).eq("id", id);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "SKU already in use" : error.message);
      load();
    }
  };

  const softDelete = async (id: string) => {
    if (!confirm("Deactivate this variant? Stock history is preserved.")) return;
    await supabase.from("product_variants").update({ status: "inactive" } as any).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] tracking-[0.12em] uppercase text-[hsl(220,10%,65%)]" style={fontStyle}>
            Variants
          </h3>
          <p className="text-[11px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>
            Size × colour matrix · SKU, price and status editable here · stock is managed on the Stock page
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,55%)] border border-[hsl(220,10%,20%)] hover:border-[hsl(220,10%,35%)] transition-colors"
            style={fontStyle}
          >
            <RefreshCcw size={12} /> Reload
          </button>
          <button
            type="button"
            onClick={generateMissing}
            disabled={busy || !sizes.length || !colours.length}
            className="flex items-center gap-1.5 h-8 px-3 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,15%,8%)] bg-[hsl(220,10%,80%)] hover:bg-[hsl(220,10%,70%)] transition-colors disabled:opacity-40"
            style={fontStyle}
          >
            <Plus size={12} /> Generate variants
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-[12px] text-[hsl(220,10%,40%)]" style={fontStyle}>Loading variants...</p>
      ) : !sizes.length || !colours.length ? (
        <p className="text-[12px] text-[hsl(220,10%,45%)] p-4 border border-dashed border-[hsl(220,10%,18%)]" style={fontStyle}>
          Add at least one size and one colour above, then generate the variant matrix.
        </p>
      ) : (
        <div className="border border-[hsl(220,10%,14%)] overflow-x-auto">
          <table className="w-full text-[11px]" style={fontStyle}>
            <thead className="bg-[hsl(220,15%,8%)]">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] font-normal">Size \ Colour</th>
                {colours.map(c => (
                  <th key={c} className="text-left px-3 py-2 text-[10px] tracking-[0.12em] uppercase text-[hsl(220,10%,45%)] font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map(size => (
                <tr key={size} className="border-t border-[hsl(220,10%,12%)]">
                  <td className="px-3 py-2 text-[hsl(220,10%,70%)] uppercase tracking-[0.1em]">{size}</td>
                  {colours.map(colour => {
                    const cell = getCell(size, colour);
                    if (!cell) {
                      return <td key={colour} className="px-3 py-2 text-[hsl(220,10%,25%)]">—</td>;
                    }
                    return (
                      <td key={colour} className="px-2 py-2 align-top">
                        <div className="space-y-1.5 min-w-[160px]">
                          <input
                            defaultValue={cell.sku || ""}
                            onBlur={e => e.target.value !== cell.sku && updateCell(cell.id, { sku: e.target.value })}
                            placeholder="SKU"
                            className="w-full h-7 px-2 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[11px]"
                          />
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="1"
                              defaultValue={cell.price ?? ""}
                              onBlur={e => {
                                const v = e.target.value === "" ? null : Number(e.target.value);
                                if (v !== cell.price) updateCell(cell.id, { price: v as any });
                              }}
                              placeholder="Price"
                              className="w-20 h-7 px-2 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,80%)] text-[11px]"
                            />
                            <span className="text-[hsl(220,10%,40%)]">stk {cell.stock_quantity}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <select
                              defaultValue={cell.status}
                              onChange={e => updateCell(cell.id, { status: e.target.value })}
                              className="h-6 px-1 bg-[hsl(220,15%,10%)] border border-[hsl(220,10%,16%)] text-[hsl(220,10%,70%)] text-[10px]"
                            >
                              <option value="active">Active</option>
                              <option value="sold_out">Sold out</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => softDelete(cell.id)}
                              className="text-[hsl(220,10%,30%)] hover:text-[hsl(0,50%,55%)]"
                              title="Deactivate"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
