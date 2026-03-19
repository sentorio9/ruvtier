import AdminLayout from "../components/AdminLayout";
import { ShoppingBag } from "lucide-react";

export default function AdminCarts() {
  const fontStyle = { fontFamily: "var(--font-sans)" };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-[22px] font-light tracking-[0.12em] text-[hsl(220,10%,85%)]" style={fontStyle}>Carts</h1>
        <p className="text-[12px] text-[hsl(220,10%,40%)] mt-1" style={fontStyle}>Active & abandoned cart tracking</p>
      </div>

      <div className="text-center py-20">
        <ShoppingBag size={32} className="mx-auto text-[hsl(220,10%,20%)] mb-4" />
        <p className="text-[14px] text-[hsl(220,10%,35%)]" style={fontStyle}>Cart tracking not yet active</p>
        <p className="text-[12px] text-[hsl(220,10%,25%)] mt-1" style={fontStyle}>This module will activate with commerce integration</p>
      </div>
    </AdminLayout>
  );
}
