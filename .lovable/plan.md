Replace the current desktop category row (Women / Men / Lifestyle / The House) with the six requested items, wire each to a working route, add the missing translations, and create the two new destination pages.

### What will change

1. **Navigation header** (`src/components/Navigation.tsx`)
   - Reorder/replace `CATEGORY_ROUTES` to:
     - New Arrival → `/new-arrival`
     - Collection → `/collection`
     - Women → `/boutique/women`
     - Men → `/boutique/men`
     - By Allocation → `/by-allocation`
     - The House → `/the-house`
   - Keep the same visual treatment (uppercase, tracking, active underline).

2. **Translations** (`src/i18n/translations.ts`)
   - Add `nav.new_arrival`, `nav.collection`, `nav.by_allocation` keys.
   - Provide English, French, German, Italian, Spanish, Portuguese, Japanese, Korean, Traditional Chinese, Simplified Chinese, and Arabic equivalents.

3. **New pages**
   - `src/pages/NewArrivalPage.tsx`: editorial grid of `featured = true` products, sorted by newest first.
   - `src/pages/ByAllocationPage.tsx`: dedicated page for products whose `availability = 'by_allocation'`.
   - Both pages reuse the existing product-card grid, `Navigation`, and `LuxuryFooter` patterns.

4. **Routing** (`src/App.tsx`)
   - Register `/new-arrival` and `/by-allocation`.
   - Keep existing `/collection`, `/boutique/women`, `/boutique/men`, `/the-house` routes unchanged.

5. **Sitemap** (`public/sitemap.xml`)
   - Add `/new-arrival` and `/by-allocation`.

6. **Mobile slide menu** (`src/components/FullScreenMenu.tsx`)
   - Optionally add the same six destinations to the primary panel so mobile users see the new structure too.

### Out of scope
- No changes to the drawer's layout, palette, or typography.
- No changes to the admin panel.
- No changes to product data or schema.

### Verification
- TypeScript typecheck passes.
- Playwright checks that the header renders the six labels at 1440px and 1920px.
- Mobile check confirms the category row is hidden on small screens (existing behavior) and the slide menu reflects the new items if updated.