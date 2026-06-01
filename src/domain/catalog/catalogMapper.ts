import type {
  CatalogImage,
  CatalogInventory,
  CatalogOption,
  CatalogProduct,
  CatalogVariant,
  LegacyProductRow,
  SyncStatus,
} from "./types";

const SYNC_STATUSES: SyncStatus[] = ["local", "pending", "synced", "error"];

type RawObject = Record<string, unknown>;

const isObject = (value: unknown): value is RawObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asObjectArray = (value: unknown): RawObject[] => {
  if (Array.isArray(value)) return value.filter(isObject);
  if (isObject(value)) return [value];
  return [];
};

const asString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const asStringOrNull = (value: unknown) => {
  const next = asString(value).trim();
  return next.length > 0 ? next : null;
};

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asNumberOrNull = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
};

const asBoolean = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const asSyncStatus = (value: unknown): SyncStatus => {
  const next = asString(value) as SyncStatus;
  return SYNC_STATUSES.includes(next) ? next : "local";
};

const asOptionValues = (value: unknown): Record<string, string | null> => {
  if (!isObject(value)) return {};

  return Object.fromEntries(
    Object.entries(value).map(([key, optionValue]) => [
      key,
      optionValue == null ? null : String(optionValue),
    ]),
  );
};

const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;

export const coerceStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (item == null ? "" : String(item).trim()))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  return [];
};

const mapCatalogInventory = (raw: RawObject): CatalogInventory => ({
  id: asString(raw.id),
  variant_id: asString(raw.variant_id),
  quantity_available: asNumber(raw.quantity_available),
  quantity_reserved: asNumber(raw.quantity_reserved),
  quantity_committed: asNumber(raw.quantity_committed),
  quantity_incoming: asNumber(raw.quantity_incoming),
  inventory_policy: asString(raw.inventory_policy, "deny"),
  tracked: asBoolean(raw.tracked, true),
  shopify_inventory_item_id: asStringOrNull(raw.shopify_inventory_item_id),
  shopify_location_id: asStringOrNull(raw.shopify_location_id),
  sync_status: asSyncStatus(raw.sync_status),
  shopify_synced_at: asStringOrNull(raw.shopify_synced_at),
  created_at: asStringOrNull(raw.created_at) ?? undefined,
  updated_at: asStringOrNull(raw.updated_at) ?? undefined,
});

const mapCatalogVariant = (raw: RawObject): CatalogVariant => {
  const inventory = asObjectArray(raw.product_inventory ?? raw.inventory)[0];

  return {
    id: asString(raw.id),
    product_id: asString(raw.product_id),
    title: asString(raw.title, "Default"),
    sku: asStringOrNull(raw.sku),
    barcode: asStringOrNull(raw.barcode),
    option_values: asOptionValues(raw.option_values),
    price: asNumberOrNull(raw.price),
    compare_at_price: asNumberOrNull(raw.compare_at_price),
    position: asNumber(raw.position, 1),
    status: asString(raw.status, "draft"),
    is_default: asBoolean(raw.is_default),
    requires_shipping: asBoolean(raw.requires_shipping, true),
    taxable: asBoolean(raw.taxable, true),
    shopify_variant_id: asStringOrNull(raw.shopify_variant_id),
    shopify_inventory_item_id: asStringOrNull(raw.shopify_inventory_item_id),
    sync_status: asSyncStatus(raw.sync_status),
    shopify_synced_at: asStringOrNull(raw.shopify_synced_at),
    deleted_at: asStringOrNull(raw.deleted_at),
    inventory: inventory ? mapCatalogInventory(inventory) : null,
    created_at: asStringOrNull(raw.created_at) ?? undefined,
    updated_at: asStringOrNull(raw.updated_at) ?? undefined,
  };
};

const mapCatalogOption = (raw: RawObject): CatalogOption => ({
  id: asString(raw.id),
  product_id: asString(raw.product_id),
  name: asString(raw.name),
  position: asNumber(raw.position, 1),
  option_values: coerceStringArray(raw.option_values),
  shopify_option_id: asStringOrNull(raw.shopify_option_id),
  sync_status: asSyncStatus(raw.sync_status),
  shopify_synced_at: asStringOrNull(raw.shopify_synced_at),
  created_at: asStringOrNull(raw.created_at) ?? undefined,
  updated_at: asStringOrNull(raw.updated_at) ?? undefined,
});

const mapCatalogImage = (raw: RawObject): CatalogImage => ({
  id: asString(raw.id),
  product_id: asString(raw.product_id),
  variant_id: asStringOrNull(raw.variant_id),
  url: asString(raw.url),
  alt_text: asStringOrNull(raw.alt_text),
  position: asNumber(raw.position, 1),
  role: asString(raw.role, "gallery"),
  storage_bucket: asStringOrNull(raw.storage_bucket),
  storage_path: asStringOrNull(raw.storage_path),
  content_type: asStringOrNull(raw.content_type),
  file_size_bytes: asNumberOrNull(raw.file_size_bytes),
  shopify_image_id: asStringOrNull(raw.shopify_image_id),
  sync_status: asSyncStatus(raw.sync_status),
  shopify_synced_at: asStringOrNull(raw.shopify_synced_at),
  created_at: asStringOrNull(raw.created_at) ?? undefined,
  updated_at: asStringOrNull(raw.updated_at) ?? undefined,
});

const firstImageByRole = (images: CatalogImage[], role: string) =>
  images.filter((image) => image.role === role).sort(byPosition)[0] ?? null;

const optionValuesByName = (options: CatalogOption[], name: string) =>
  options.find((option) => option.name.toLowerCase() === name)?.option_values ?? [];

export const mapCatalogProduct = (rawProduct: unknown): CatalogProduct => {
  const raw = (isObject(rawProduct) ? rawProduct : {}) as LegacyProductRow & RawObject;
  const options = asObjectArray(raw.product_options).map(mapCatalogOption).sort(byPosition);
  const variants = asObjectArray(raw.product_variants).map(mapCatalogVariant).sort(byPosition);
  const images = asObjectArray(raw.product_images)
    .map(mapCatalogImage)
    .filter((image) => image.url)
    .sort(byPosition);

  const defaultVariant =
    variants.find((variant) => variant.is_default && !variant.deleted_at) ??
    variants.find((variant) => !variant.deleted_at) ??
    variants[0] ??
    null;

  const inventory = defaultVariant?.inventory ?? null;
  const legacySizeOptions = coerceStringArray(raw.size_options);
  const legacyColorOptions = coerceStringArray(raw.color_options);
  const legacyGallery = coerceStringArray(raw.media_gallery);
  const sizeOptions = optionValuesByName(options, "size");
  const colorOptions = optionValuesByName(options, "color");
  const galleryImages = images.filter((image) => image.role === "gallery").sort(byPosition);
  const thumbnail = firstImageByRole(images, "thumbnail");
  const hero = firstImageByRole(images, "hero");

  return {
    ...(raw as LegacyProductRow),
    price: defaultVariant?.price ?? raw.price ?? null,
    compare_at_price: defaultVariant?.compare_at_price ?? raw.compare_at_price ?? null,
    sku: defaultVariant?.sku ?? raw.sku ?? null,
    stock_quantity: inventory ? inventory.quantity_available : raw.stock_quantity ?? null,
    size_options: sizeOptions.length > 0 ? sizeOptions : raw.size_options ?? null,
    color_options: colorOptions.length > 0 ? colorOptions : raw.color_options ?? null,
    media_gallery: galleryImages.length > 0 ? galleryImages.map((image) => image.url) : raw.media_gallery ?? null,
    thumbnail_url: thumbnail?.url ?? raw.thumbnail_url ?? null,
    hero_image_url: hero?.url ?? raw.hero_image_url ?? null,
    options,
    variants,
    images,
    inventory,
    default_variant: defaultVariant,
  };
};
