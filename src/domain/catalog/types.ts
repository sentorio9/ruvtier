import type { Tables } from "@/integrations/supabase/types";

export type SyncStatus = "local" | "pending" | "synced" | "error";

export type LegacyProductRow = Tables<"products"> & {
  shopify_product_id?: string | null;
  shopify_handle?: string | null;
  shopify_status?: string | null;
  shopify_synced_at?: string | null;
  sync_status?: SyncStatus;
};

export type CatalogOption = {
  id: string;
  product_id: string;
  name: string;
  position: number;
  option_values: string[];
  shopify_option_id: string | null;
  sync_status: SyncStatus;
  shopify_synced_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CatalogInventory = {
  id: string;
  variant_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_committed: number;
  quantity_incoming: number;
  inventory_policy: "deny" | "continue" | string;
  tracked: boolean;
  shopify_inventory_item_id: string | null;
  shopify_location_id: string | null;
  sync_status: SyncStatus;
  shopify_synced_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CatalogVariant = {
  id: string;
  product_id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  option_values: Record<string, string | null>;
  price: number | null;
  compare_at_price: number | null;
  position: number;
  status: "draft" | "active" | "archived" | string;
  is_default: boolean;
  requires_shipping: boolean;
  taxable: boolean;
  shopify_variant_id: string | null;
  shopify_inventory_item_id: string | null;
  sync_status: SyncStatus;
  shopify_synced_at: string | null;
  deleted_at: string | null;
  inventory: CatalogInventory | null;
  created_at?: string;
  updated_at?: string;
};

export type CatalogImage = {
  id: string;
  product_id: string;
  variant_id: string | null;
  url: string;
  alt_text: string | null;
  position: number;
  role: "thumbnail" | "hero" | "gallery" | string;
  storage_bucket: string | null;
  storage_path: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
  shopify_image_id: string | null;
  sync_status: SyncStatus;
  shopify_synced_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CatalogProduct = LegacyProductRow & {
  options: CatalogOption[];
  variants: CatalogVariant[];
  images: CatalogImage[];
  inventory: CatalogInventory | null;
  default_variant: CatalogVariant | null;
};

export type ProductCatalogFilters = {
  collection?: string;
  gender?: string;
  featured?: boolean;
  limit?: number;
};
