import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_PREFIX } from "@/admin/config";
import MaintenancePage from "@/pages/MaintenancePage";

interface Settings {
  maintenance_enabled: boolean;
  maintenance_headline: string;
  maintenance_subline: string;
  maintenance_collect_email: boolean;
}

const DEFAULTS: Settings = {
  maintenance_enabled: false,
  maintenance_headline: "The House is in quiet preparation.",
  maintenance_subline:
    "We are returning shortly. Leave your email and we will write to you when the doors reopen.",
  maintenance_collect_email: true,
};

// Admin can preview the live site even when maintenance is on by adding ?preview=1
const PREVIEW_KEY = "ruvtier_admin_preview";

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  // Allow opt-in preview bypass via ?preview=1 (admin tool)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("preview") === "1") {
      sessionStorage.setItem(PREVIEW_KEY, "1");
    }
  }, [location.search]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await (supabase.from("site_settings" as any) as any)
        .select("maintenance_enabled, maintenance_headline, maintenance_subline, maintenance_collect_email")
        .eq("id", 1)
        .maybeSingle();
      if (!alive) return;
      setSettings(data || DEFAULTS);
      setLoading(false);
    })();

    // Live sync — if admin toggles maintenance, public reflects within seconds
    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "site_settings" },
        (payload) => {
          const next = payload.new as any;
          setSettings({
            maintenance_enabled: next.maintenance_enabled,
            maintenance_headline: next.maintenance_headline,
            maintenance_subline: next.maintenance_subline,
            maintenance_collect_email: next.maintenance_collect_email,
          });
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Admin routes always render — admins must always reach the panel
  const isAdminRoute = location.pathname.startsWith(ADMIN_PREFIX);
  // Reset password must remain reachable so users can complete recovery
  const isResetPassword = location.pathname === "/reset-password";
  const hasPreviewBypass = sessionStorage.getItem(PREVIEW_KEY) === "1";

  if (loading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (settings?.maintenance_enabled && !isAdminRoute && !isResetPassword && !hasPreviewBypass) {
    return (
      <MaintenancePage
        headline={settings.maintenance_headline}
        subline={settings.maintenance_subline}
        collectEmail={settings.maintenance_collect_email}
      />
    );
  }

  return <>{children}</>;
}
