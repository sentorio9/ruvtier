/**
 * RUVTIER — Brand copy constants.
 *
 * Every hard-coded marketing string that currently lives in page JSX
 * is mirrored here so designers, translators, and AI agents can read
 * the full house voice from a single file.
 *
 * Strings are byte-for-byte identical to the originals in the pages.
 * Supabase-backed copy stays in Supabase; this file only mirrors the
 * fallbacks passed to `useSiteText(...)` and any plain JSX literals.
 *
 * Voice rules (also documented in DESIGN_SYSTEM.md):
 *  • contemplative, slow, declarative
 *  • materials are subjects, not adjectives
 *  • no emoji, no exclamation marks
 *  • italics reserved for closing lines
 *  • em-dash for emphasis; "by allocation" / "by appointment only" register
 *  • Title Case for collection names; UPPERCASE+tracking for utility labels
 */

// ─────────────────────────────────────────────────────────────────────────────
// Homepage — src/pages/Index.tsx
// ─────────────────────────────────────────────────────────────────────────────

/** Hero — main editorial headline, large serif over the cover image. */
export const HOME_HERO_HEADLINE = "Permanence in garment form";

/** Hero — small eyebrow above headline. */
export const HOME_HERO_EYEBROW = "SPRING / SUMMER 2026";

/** Hero — primary CTA label (rendered uppercase via type-cta). */
export const HOME_HERO_CTA = "Discover the Collection";

/** Hero — small utility caption, bottom-right. */
export const HOME_HERO_UTILITY = "full-bleed film, slow pan ↻";

/** Hero — Women pre-order link label. */
export const HOME_HERO_PREORDER_WOMEN = "Pre-Order for Women";

/** Hero — Men pre-order link label. */
export const HOME_HERO_PREORDER_MEN = "Pre-Order for Men";

/** Material is Memory section — headline and CTA. */
export const HOME_MATERIAL_MEMORY_HEADLINE = "Material is Memory";
export const HOME_MATERIAL_MEMORY_CTA = "Discover all material";

/** Split Collection card — Women. */
export const HOME_WOMEN_CARD = {
  season: "Spring / Summer 2026",
  title: "Women's Collection",
  blurb: "Refined silhouettes shaped by material devotion and quiet permanence.",
  cta: "Discover More",
} as const;

/** Split Collection card — Men. */
export const HOME_MEN_CARD = {
  season: "Spring / Summer 2026",
  title: "Men's Collection",
  blurb: "Understated forms built from heritage craft and enduring composition.",
  cta: "Explore Collection",
} as const;

/** In Your Keeping — section headline. */
export const HOME_IN_YOUR_KEEPING_HEADLINE = "In Your Keeping";

/** In Your Keeping — tile labels (CTA on each tile is "Explore"). */
export const HOME_IN_YOUR_KEEPING_TILES = [
  { label: "Knitwear", to: "/boutique/women" },
  { label: "Life in RUVTIER", to: "/boutique/lifestyle" },
  { label: "By Appointment Only", to: "/contact" },
] as const;

/** In Your Keeping — shared per-tile CTA. */
export const HOME_IN_YOUR_KEEPING_TILE_CTA = "Explore";

/** Featured pre-order block — static labels around dynamic product data. */
export const HOME_FEATURED_PREORDER = {
  eyebrow: "Private Access — Pre-Register",
  allocationNote: "Available by allocation — not open purchase",
  ctaPreorder: "Pre-Register",
  ctaProduct: "Discover the Piece",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// The House — src/pages/TheHousePage.tsx (manifesto paragraphs)
// ─────────────────────────────────────────────────────────────────────────────

export const HOUSE_MANIFESTO = {
  discipline:
    "At Ruvtier, stillness is a discipline. It governs cut, material, proportion. Silence is treated as material — measured, protected, never filled.",
  craft:
    "Work proceeds without audience. Decisions are slow and final. What is unresolved is not released. Craft is continuity. Seams dissolve into structure. Weight is calibrated. Drape is held, not performed. Materials are refined until their presence becomes quiet, revealing themselves only through time and wear.",
  garments:
    "Garments conceived between motion and rest. Composed in movement. Stable in stillness.",
  philosophy:
    "The house extends beyond clothing — dry scent, matte surface, spaces shaped by proportion, light, absence. Ruvtier is for those who recognize restraint without explanation, whose precision is a form of respect.",
  founder:
    "Founded by Rexford Joon Valenttier. He serves as custodian.",
  closing:
    "Ruvtier does not persuade. It remains.",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Materials — src/pages/Materials.tsx & src/pages/MaterialPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

/** Materials index — intro copy. */
export const MATERIALS_INTRO = {
  headline: "Material is memory",
  body: "Each fibre begins as landscape. We honour that origin.",
} as const;

/** Per-material descriptive prose (slug → paragraph). */
export const MATERIAL_DESCRIPTIONS: Record<string, string> = {
  vicuna:
    "The rarest fibre on earth, gathered once a year from the high Andes. A material that carries silence in its warmth.",
  cashmere:
    "Gathered from the underfleece of highland goats. A fabric that remembers the cold and answers with gentleness.",
  "merino-wool":
    "Fine-gauge merino, bred for softness beyond measure. Each fibre a quiet act of precision.",
  silk:
    "A filament born from stillness. Silk carries light the way memory carries time.",
  "french-linen":
    "Grown in the fields of Normandy. Linen that softens with every season, never losing its character.",
  denim:
    "Selvedge denim woven on heritage shuttle looms. A weight that earns its memory through wear, fading into the rhythm of a life.",
};

/** Fallback when a material slug is unknown. */
export const MATERIAL_FALLBACK_DESCRIPTION =
  "The first pieces are in quiet preparation.";

// ─────────────────────────────────────────────────────────────────────────────
// Rituals of Care — src/pages/RitualsOfCarePage.tsx
// ─────────────────────────────────────────────────────────────────────────────

export const RITUALS_HEADING = "Rituals of Care";

export const RITUALS_INTRO_PARAGRAPHS = [
  "Respect for material defines how a RUVTIER piece is made and how it is kept.",
  "A RUVTIER piece, when preserved with care, will outlast seasons and often, its first owner. Ownership is never absolute; each piece is held in stewardship.",
] as const;

export const RITUALS_SECTIONS = [
  {
    title: "Daily Handling",
    paragraphs: [
      "Allow each piece to breathe between wear.",
      "Time preserves what haste erodes.",
    ],
  },
  {
    title: "A Note on Time",
    paragraphs: [
      "Delicate changes in texture, softness, and drape are not flaws. They are the quiet record of a life well worn.",
      "What a piece becomes over time is part of its value.",
    ],
  },
  {
    title: "Cashmere & Baby Cashmere",
    paragraphs: [
      "Cashmere is among the most delicate fibres in the world, valued not for resilience, but for its quiet softness.",
      "After wear, allow the garment to rest. Air it gently, away from direct light, before returning it to your wardrobe.",
      "With considered care, cashmere softens, deepens, and becomes more personal with time.",
    ],
  },
  {
    title: "Silk",
    paragraphs: [
      "Silk responds to its environment with sensitivity. Light, movement, and touch all leave their trace.",
      "Avoid prolonged exposure to direct light, which may soften its tone. Contact with water, oils, or fragrance should remain minimal.",
      "After wear, allow the piece to rest and breathe before storing.",
      "Silk retains its beauty not through intervention, but through restraint.",
    ],
  },
  {
    title: "Leather",
    paragraphs: [
      "Leather is a living material. It evolves, developing a patina that reflects time, use, and touch.",
      "Avoid unnecessary friction or pressure that may alter its surface.",
      "When not in use, store in a dust bag, allowing the piece to maintain its shape and character.",
    ],
  },
] as const;

export const RITUALS_RESTORATION = {
  heading: "RUVTIER Restoration",
  paragraphs: [
    "RUVTIER pieces are created to remain.",
    "Over time, should a piece require attention, it may be returned to the house for careful assessment and restoration.",
    "Each restoration is approached individually. Subtle variations, developed through wear, are respected as part of the garment or object's history.",
    "For guidance, or to arrange a restoration, clients may contact the house directly.",
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Stillness — src/pages/Stillness.tsx
// ─────────────────────────────────────────────────────────────────────────────

export const STILLNESS_QUOTE =
  "Every fibre carries origin, landscape, and time.\nWe begin there, in silence.";
export const STILLNESS_CTA = "Return";

// ─────────────────────────────────────────────────────────────────────────────
// Closing italic lines — intentionally consistent across the site.
// One quiet final cadence per page; never followed by another paragraph.
// ─────────────────────────────────────────────────────────────────────────────

export const CLOSING_LINES = {
  /** Foot of TheHousePage manifesto. */
  house: HOUSE_MANIFESTO.closing,
  /** Foot of Rituals of Care. */
  rituals:
    "To restore a RUVTIER piece is not to make it new\nbut to allow it to continue.",
  /** Stillness — the page itself is a single closing cadence. */
  stillness: STILLNESS_QUOTE,
} as const;
