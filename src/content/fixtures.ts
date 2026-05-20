/**
 * RUVTIER — Sample product fixtures.
 *
 * Static, hand-written product records for designers and AI agents
 * working on the brand outside the running app. Use these whenever
 * Supabase is unreachable or you need realistic copy in mocks.
 *
 * These records are NOT imported by the live app; they exist purely
 * as documentation of the shape and tone of a RUVTIER product entry.
 *
 * House voice rules apply:
 *  • materials are subjects (not "soft cashmere" but "cashmere that…")
 *  • no marketing adjectives, no exclamation marks
 *  • prices are EUR, two-decimal numbers
 *  • availability is one of three quiet registers
 */

export type Availability = "in_store" | "made_to_measure" | "by_allocation";

export interface ProductFixture {
  slug: string;
  name: string;
  /** EUR, two-decimal. Zero-value items must render as "€0", not a dash. */
  price: number;
  description: string;
  availability: Availability;
  preorder_enabled?: boolean;
  category: "women" | "men" | "lifestyle";
  material: string;
}

export const PRODUCT_FIXTURES: ProductFixture[] = [
  {
    slug: "stillness-cashmere-coat",
    name: "The Stillness Coat",
    price: 4280,
    description:
      "A floor-length coat in undyed baby cashmere. Composed in a single panel, seamed at the shoulder, weighted to fall without performance.",
    availability: "by_allocation",
    preorder_enabled: true,
    category: "women",
    material: "Baby Cashmere",
  },
  {
    slug: "permanence-double-breasted",
    name: "Permanence Double-Breasted",
    price: 3650,
    description:
      "A double-breasted jacket cut from heritage Italian wool. Sleeve held by hand, lapel rolled — never pressed.",
    availability: "made_to_measure",
    category: "men",
    material: "Italian Wool",
  },
  {
    slug: "quiet-silk-scarf",
    name: "Quiet Silk Scarf",
    price: 420,
    description:
      "Hand-rolled silk in warm ivory. Light enough to carry on the shoulder; weighted enough to remain.",
    availability: "in_store",
    category: "women",
    material: "Silk",
  },
  {
    slug: "andes-vicuna-stole",
    name: "Andes Vicuña Stole",
    price: 6890,
    description:
      "Vicuña gathered once a year, woven in narrow widths. A material that carries silence in its warmth.",
    availability: "by_allocation",
    preorder_enabled: true,
    category: "women",
    material: "Vicuña",
  },
  {
    slug: "normandy-linen-shirt",
    name: "Normandy Linen Shirt",
    price: 580,
    description:
      "Long-sleeve shirt in French linen, washed to a soft fall. Mother-of-pearl buttons, French seams.",
    availability: "in_store",
    category: "men",
    material: "French Linen",
  },
  {
    slug: "merino-evening-knit",
    name: "Merino Evening Knit",
    price: 1240,
    description:
      "Fine-gauge merino, knitted in one piece. A quiet act of precision for the hours after light.",
    availability: "made_to_measure",
    category: "women",
    material: "Merino Wool",
  },
  {
    slug: "selvedge-denim-trouser",
    name: "Selvedge Denim Trouser",
    price: 720,
    description:
      "Selvedge denim woven on heritage shuttle looms. Cut high at the waist; the weight earns its memory through wear.",
    availability: "in_store",
    category: "men",
    material: "Selvedge Denim",
  },
  {
    slug: "house-fragrance-no-i",
    name: "House Fragrance — No. I",
    price: 240,
    description:
      "A dry, matte composition. Cedar, paper, and the air of an empty atelier.",
    availability: "in_store",
    category: "lifestyle",
    material: "Fragrance",
  },
];
