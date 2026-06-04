## Goal

Bring `/preorder/:slug` (e.g. Theia sweater) in line with the reference: a calm two-column composition with a 1-main + 2-thumbnail gallery, a Private Access intent column on the right (eyebrow, headline, price+availability line, short description, inline size selector, allocation progress, single `REQUEST ALLOCATION` CTA, fine print, and three info accordions). The full request form moves into a right-side drawer that opens from the CTA.

## Files

**Database (migration)**
- `products` — add `edition_size INT` and `allocated_count INT DEFAULT 0`, both nullable. No backfill; rows without `edition_size` simply hide the counter. RLS unchanged (existing product policies cover it).

**New components**
- `src/components/PrivateAccessDrawer.tsx` — right-side drawer (uses existing `ui/sheet`) wrapping the current form body extracted from `PreorderPage`. Receives `product`, `defaultSize`, `open`, `onClose`. Handles submit, success state, and the same form-protection/honeypot logic that lives in the page today.
- `src/components/preorder/InfoAccordion.tsx` — thin wrapper around `ui/accordion` styled for the page (hairline border-top, label in `type-eyebrow`, body in `type-body`, no chevron rotation noise). Used three times.

**Edited**
- `src/pages/PreorderPage.tsx` — rebuilt around the new layout (details below). The existing form JSX is lifted into `PrivateAccessDrawer`; the page only renders intent + CTA.
- `src/content/brand.ts` — add `PREORDER_EYEBROW_PREFIX = "PRIVATE ACCESS — EDITION OF"`, `PREORDER_CTA = "Request Allocation"`, `PREORDER_FINEPRINT = "Size guidance by appointment · Complimentary alterations for life"`, `PREORDER_AVAILABILITY = "allocated, not open purchase"`.

## Page composition

```text
luxury-container · grid lg:grid-cols-2 gap-10 lg:gap-20

LEFT (gallery)
  main image  — aspect [4/5] or [1/1], first media_gallery item
                (falls back to hero_image_url → thumbnail_url → garmentImage)
  thumbs row  — grid grid-cols-2 gap-4, items 2 & 3 from gallery
                rendered ONLY if they exist (no empty tiles); click swaps main

RIGHT (intent, sticky)
  eyebrow      type-eyebrow · tracking-luxury-widest
               "PRIVATE ACCESS — EDITION OF {edition_size}"   (hidden if null)
  h1           font-serif text-3xl md:text-4xl              — product.name
  price line   text-sm text-muted-foreground
               "{formatPrice(price)} — allocated, not open purchase"
  description  luxury-body                                   — product.description

  size block   label "SIZE" type-eyebrow
               row of square buttons from product.size_options
               selected = filled foreground; others = hairline border
               (selection passed to drawer as defaultSize)

  allocation   thin baseline rule + caption row
               left: "Allocation status"
               right: "{remaining} of {edition_size} remaining"
               (whole block hidden when edition_size is null)
               remaining = max(edition_size - (allocated_count ?? 0), 0)

  CTA          full-width black button (existing button style)
               "REQUEST ALLOCATION" → opens PrivateAccessDrawer
  fineprint    text-xs text-muted-foreground centered

  accordions   3 × InfoAccordion (hide any item whose source is empty)
    · Composition & care   ← product.materials + product.care_info (stacked)
    · Fit & measurements   ← product.size_options joined + product.long_description excerpt if relevant; fall back to "Available on request"
    · Provenance & maker   ← product.long_description (or short placeholder)
```

Motion: keep `ScrollFadeIn` on left gallery, right header, and the accordions group (small staggered delays). No new animation libraries.

## Drawer behaviour

- Opens with selected size pre-filled.
- All existing fields preserved (full name, email, country, size, delivery region, message) plus honeypot + timing guard.
- On success: drawer shows the same "Your request has been received" message, then auto-closes after 2.4 s.
- Insert payload unchanged (`preorder_requests`). No edition_size mutation from client.
- Respects scroll lock and Escape-to-close (already part of `ui/sheet`).

## Out of scope

- Admin UI to edit `edition_size` / `allocated_count` — fields exist in DB; admin form update will be a follow-up.
- Automatic increment of `allocated_count` on submit — counter is editorially curated for now (matches "Use existing fields" intent).
- Changes to other pages, navigation, footer, or design tokens.
- Image lightbox / gallery zoom.

## Verification

- Visit `/preorder/stillness-cashmere-coat` (or any preorder-enabled product); confirm layout matches the reference at desktop (1303×890) and mobile, accordions collapse cleanly, counter hides when `edition_size` is null, size selection carries into the drawer, submit still writes to `preorder_requests`.
- Re-screenshot before declaring done.
