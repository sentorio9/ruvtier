import { coerceStringArray } from "./catalogMapper";
import type { CatalogImage, CatalogProduct, CatalogVariant } from "./types";

export type ShopifyProductStatus = "active" | "draft" | "archived";

export type ShopifyOptionInput = {
  name: string;
  values: string[];
  position: number;
};

export type ShopifyVariantInput = {
  id?: string;
  title: string;
  sku?: string;
  barcode?: string;
  price?: string;
  compareAtPrice?: string;
  optionValues: Record<string, string | null>;
  inventoryQuantity: number;
  trackedInventory: boolean;
  inventoryPolicy: "deny" | "continue" | string;
  requiresShipping: boolean;
  taxable: boolean;
};

export type ShopifyImageInput = {
  id?: string;
  url: string;
  altText?: string;
  position: number;
};

export type ShopifyProductInput = {
  id?: string;
  title: string;
  handle: string;
  description?: string;
  vendor: "RUVTIER";
  productType?: string;
  status: ShopifyProductStatus;
  options: ShopifyOptionInput[];
  variants: ShopifyVariantInput[];
  images: ShopifyImageInput[];
};

export type ShopifySyncResult = {
  status: "skipped" | "pending" | "synced" | "error";
  message: string;
  shopifyProductId?: string;
};

export interface CatalogShopifyAdapter {
  toProductInput(product: CatalogProduct): ShopifyProductInput;
  pushProduct(product: CatalogProduct): Promise<ShopifySyncResult>;
  pullProduct(shopifyProductId: string): Promise<ShopifySyncResult>;
}

const formatMoney = (value: number | null | undefined) =>
  value == null ? undefined : value.toFixed(2);

const mapStatus = (status: string): ShopifyProductStatus => {
  if (status === "active" || status === "archived") return status;
  return "draft";
};

const toOptionInputs = (product: CatalogProduct): ShopifyOptionInput[] => {
  if (product.options.length > 0) {
    return product.options.map((option) => ({
      name: option.name,
      values: option.option_values,
      position: option.position,
    }));
  }

  const fallbackOptions: ShopifyOptionInput[] = [];
  const sizes = coerceStringArray(product.size_options);
  const colors = coerceStringArray(product.color_options);

  if (sizes.length > 0) {
    fallbackOptions.push({ name: "Size", values: sizes, position: 1 });
  }

  if (colors.length > 0) {
    fallbackOptions.push({
      name: "Color",
      values: colors,
      position: fallbackOptions.length + 1,
    });
  }

  return fallbackOptions;
};

const toVariantInput = (variant: CatalogVariant, product: CatalogProduct): ShopifyVariantInput => ({
  id: variant.shopify_variant_id ?? undefined,
  title: variant.title,
  sku: variant.sku ?? product.sku ?? undefined,
  barcode: variant.barcode ?? undefined,
  price: formatMoney(variant.price ?? product.price),
  compareAtPrice: formatMoney(variant.compare_at_price ?? product.compare_at_price),
  optionValues: variant.option_values,
  inventoryQuantity: variant.inventory?.quantity_available ?? product.stock_quantity ?? 0,
  trackedInventory: variant.inventory?.tracked ?? true,
  inventoryPolicy: variant.inventory?.inventory_policy ?? "deny",
  requiresShipping: variant.requires_shipping,
  taxable: variant.taxable,
});

const toVariantInputs = (product: CatalogProduct): ShopifyVariantInput[] => {
  if (product.variants.length > 0) {
    return product.variants
      .filter((variant) => !variant.deleted_at)
      .map((variant) => toVariantInput(variant, product));
  }

  return [
    {
      title: "Default",
      sku: product.sku ?? undefined,
      price: formatMoney(product.price),
      compareAtPrice: formatMoney(product.compare_at_price),
      optionValues: {},
      inventoryQuantity: product.stock_quantity ?? 0,
      trackedInventory: true,
      inventoryPolicy: "deny",
      requiresShipping: true,
      taxable: true,
    },
  ];
};

const uniqueImages = (images: ShopifyImageInput[]) => {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
};

const toImageInput = (image: CatalogImage): ShopifyImageInput => ({
  id: image.shopify_image_id ?? undefined,
  url: image.url,
  altText: image.alt_text ?? undefined,
  position: image.position,
});

const toImageInputs = (product: CatalogProduct): ShopifyImageInput[] => {
  if (product.images.length > 0) {
    return uniqueImages(product.images.map(toImageInput));
  }

  const legacyUrls = [
    product.thumbnail_url,
    product.hero_image_url,
    ...coerceStringArray(product.media_gallery),
  ].filter((url): url is string => Boolean(url));

  return uniqueImages(
    legacyUrls.map((url, index) => ({
      url,
      altText: product.name,
      position: index + 1,
    })),
  );
};

export class DeferredShopifyCatalogAdapter implements CatalogShopifyAdapter {
  toProductInput(product: CatalogProduct): ShopifyProductInput {
    return {
      id: product.shopify_product_id ?? undefined,
      title: product.name,
      handle: product.shopify_handle ?? product.slug,
      description: product.description ?? undefined,
      vendor: "RUVTIER",
      productType: product.collection ?? undefined,
      status: mapStatus(product.status),
      options: toOptionInputs(product),
      variants: toVariantInputs(product),
      images: toImageInputs(product),
    };
  }

  async pushProduct(): Promise<ShopifySyncResult> {
    return {
      status: "skipped",
      message:
        "Shopify sync is intentionally deferred. Implement this adapter behind a server-side Edge Function before using Shopify secrets.",
    };
  }

  async pullProduct(): Promise<ShopifySyncResult> {
    return {
      status: "skipped",
      message:
        "Shopify pull is intentionally deferred. Supabase remains source of truth until the server-side sync adapter is implemented.",
    };
  }
}

export const shopifyCatalogAdapter = new DeferredShopifyCatalogAdapter();
