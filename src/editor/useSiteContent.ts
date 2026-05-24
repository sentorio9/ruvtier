import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

/**
 * In-memory cache of site_content rows keyed by content_key.
 * Loaded once on first use, kept in sync via Supabase Realtime so admin
 * edits in the iframe show instantly without a full reload.
 */
type Row = { content_key: string; content_value: Record<string, any> };

const cache = new Map<string, Row>();
const listeners = new Set<() => void>();
let loaded = false;
let loading: Promise<void> | null = null;

function notify() {
  listeners.forEach((l) => l());
}

async function loadOnce() {
  if (loaded || loading) return loading ?? Promise.resolve();
  if (!isSupabaseConfigured) {
    loaded = true;
    return Promise.resolve();
  }

  loading = (async () => {
    const { data } = await supabase
      .from("site_content" as any)
      .select("content_key, content_value");
    ((data as any[]) || []).forEach((r) => cache.set(r.content_key, r as Row));
    loaded = true;
    notify();

    // Realtime sync
    supabase
      .channel("site_content_overrides")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        (payload: any) => {
          const row = (payload.new || payload.old) as Row;
          if (!row?.content_key) return;
          if (payload.eventType === "DELETE") {
            cache.delete(row.content_key);
          } else {
            cache.set(row.content_key, row);
          }
          notify();
        }
      )
      .subscribe();
  })();
  return loading;
}

export function useSiteText(key: string, field: string, fallback: string): string {
  const [, force] = useState(0);
  useEffect(() => {
    let mounted = true;
    loadOnce();
    const l = () => mounted && force((n) => n + 1);
    listeners.add(l);
    return () => {
      mounted = false;
      listeners.delete(l);
    };
  }, []);
  const value = cache.get(key)?.content_value?.[field];
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function useSiteImage(key: string, fallback?: string): string | undefined {
  const [, force] = useState(0);
  useEffect(() => {
    let mounted = true;
    loadOnce();
    const l = () => mounted && force((n) => n + 1);
    listeners.add(l);
    return () => {
      mounted = false;
      listeners.delete(l);
    };
  }, []);
  const url = cache.get(key)?.content_value?.url;
  return typeof url === "string" && url.length > 0 ? url : fallback;
}
