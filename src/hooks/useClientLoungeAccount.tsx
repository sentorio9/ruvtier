import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ClientLoungeOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string | null;
  line_items: unknown[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  fulfilled_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientLoungeCart = {
  id: string;
  item_count: number;
  items: unknown[];
  subtotal: number;
  status: string;
  created_at: string;
  updated_at: string;
  abandoned_at: string | null;
  recovered_at: string | null;
};

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asNumber = (value: unknown): number => (typeof value === "number" ? value : Number(value ?? 0) || 0);

const normalizeOrder = (row: any): ClientLoungeOrder => ({
  id: row.id,
  order_number: row.order_number,
  status: row.status,
  payment_status: row.payment_status ?? null,
  line_items: asArray(row.line_items),
  subtotal: asNumber(row.subtotal),
  tax: asNumber(row.tax),
  shipping: asNumber(row.shipping),
  total: asNumber(row.total),
  fulfilled_at: row.fulfilled_at ?? null,
  cancelled_at: row.cancelled_at ?? null,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const normalizeCart = (row: any): ClientLoungeCart => ({
  id: row.id,
  item_count: Number(row.item_count ?? 0),
  items: asArray(row.items),
  subtotal: asNumber(row.subtotal),
  status: row.status,
  created_at: row.created_at,
  updated_at: row.updated_at,
  abandoned_at: row.abandoned_at ?? null,
  recovered_at: row.recovered_at ?? null,
});

export function useClientLoungeAccount() {
  const { user } = useAuth();
  const enabled = isSupabaseConfigured && Boolean(user);

  const orders = useQuery<ClientLoungeOrder[]>({
    queryKey: ["client-lounge", "orders", user?.id],
    enabled,
    initialData: [],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_client_lounge_orders" as any);
      if (error) throw error;
      return (data ?? []).map(normalizeOrder);
    },
  });

  const carts = useQuery<ClientLoungeCart[]>({
    queryKey: ["client-lounge", "carts", user?.id],
    enabled,
    initialData: [],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_client_lounge_carts" as any);
      if (error) throw error;
      return (data ?? []).map(normalizeCart);
    },
  });

  return {
    orders: orders.data,
    carts: carts.data,
    loading: orders.isLoading || carts.isLoading,
    error: orders.error?.message || carts.error?.message || null,
    refetch: () => Promise.all([orders.refetch(), carts.refetch()]),
  };
}
