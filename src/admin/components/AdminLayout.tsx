import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth";
import {
  LayoutDashboard, Package, ShoppingCart, Users, ScrollText,
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, ShoppingBag, ClipboardList, Power
} from "lucide-react";
import { ADMIN_PREFIX } from "../config";

const navItems = [
  { to: ADMIN_PREFIX, icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: `${ADMIN_PREFIX}/products`, icon: Package, label: "Products" },
  { to: `${ADMIN_PREFIX}/orders`, icon: ShoppingCart, label: "Orders" },
  { to: `${ADMIN_PREFIX}/customers`, icon: Users, label: "Customers" },
  { to: `${ADMIN_PREFIX}/carts`, icon: ShoppingBag, label: "Carts" },
  { to: `${ADMIN_PREFIX}/preorders`, icon: ClipboardList, label: "Preorders" },
  { to: `${ADMIN_PREFIX}/content`, icon: FileText, label: "Content" },
  { to: `${ADMIN_PREFIX}/maintenance`, icon: Power, label: "Maintenance" },
  { to: `${ADMIN_PREFIX}/logs`, icon: ScrollText, label: "Audit Logs" },
  { to: `${ADMIN_PREFIX}/settings`, icon: Settings, label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { role, displayLabel, signOut } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(`${ADMIN_PREFIX}/login`);
  };

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[hsl(220,15%,6%)] flex">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[hsl(220,15%,8%)] border-r border-[hsl(220,10%,14%)] flex flex-col transition-all duration-300 z-50 ${
          collapsed ? "w-[60px]" : "w-[220px]"
        }`}
      >
        {/* Brand */}
        <div className="h-14 flex items-center px-4 border-b border-[hsl(220,10%,14%)]">
          {!collapsed && (
            <span
              className="text-[13px] tracking-[0.18em] uppercase text-[hsl(220,10%,60%)]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Ruvtier Ops
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`text-[hsl(220,10%,40%)] hover:text-[hsl(220,10%,65%)] transition-colors ${collapsed ? "mx-auto" : "ml-auto"}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 h-9 px-4 text-[12px] tracking-[0.1em] uppercase transition-colors ${
                  active
                    ? "text-[hsl(220,10%,90%)] bg-[hsl(220,15%,12%)]"
                    : "text-[hsl(220,10%,45%)] hover:text-[hsl(220,10%,70%)] hover:bg-[hsl(220,15%,10%)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={16} strokeWidth={1.5} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[hsl(220,10%,14%)] p-3">
          {!collapsed && (
            <div className="mb-2 px-1">
              <p className="text-[11px] text-[hsl(220,10%,50%)] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                {displayLabel || "Operator"}
              </p>
              <p className="text-[10px] text-[hsl(220,10%,30%)] uppercase tracking-wider" style={{ fontFamily: "var(--font-sans)" }}>
                {role}
              </p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={`flex items-center gap-2 text-[11px] tracking-[0.1em] uppercase text-[hsl(220,10%,40%)] hover:text-[hsl(0,50%,60%)] transition-colors ${collapsed ? "mx-auto" : ""}`}
            style={{ fontFamily: "var(--font-sans)" }}
            title="Sign out"
          >
            <LogOut size={14} strokeWidth={1.5} />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[60px]" : "ml-[220px]"}`}>
        <div className="p-6 md:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
