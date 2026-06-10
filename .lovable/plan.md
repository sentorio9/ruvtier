## Problem

The homepage hero section sits flush at the top of the page, but `Navigation` is `position: fixed` with two rows on desktop (~96px total: 56px utility + 40px category row) and ~52px on mobile. The top of the hero image is being covered by those header rows.

## Fix

Single, surgical change in `src/pages/Index.tsx` on the hero `<section>` (line 109): add top padding equal to the fixed header height so the image starts fully below it.

Change:
```
<section className="bg-background section-pad-sm">
```
to:
```
<section className="bg-background pt-[60px] md:pt-[112px] pb-[var(--section-pad-sm,…)]">
```
(keep existing bottom spacing — implement by adding `pt-[60px] md:pt-[112px]` and keeping `section-pad-sm`, then neutralizing its top via an inline override, or simply replace with explicit `pt-[60px] md:pt-[112px] pb-16 md:pb-24` matching the current section-pad-sm bottom value).

Values:
- Mobile: 52px nav + 8px breathing room = **60px**
- Desktop: 56px + 40px + 16px breathing room = **112px**

## Out of scope

- No palette, copy, animation, or layout changes.
- No changes to `Navigation`, other sections, or the hero image itself.
