Fix the mobile footer overlap before any other task.

1. Correct the breakpoint issue causing `md:hidden` / `hidden md:grid` to fail on phones.
   - The current Tailwind config sets `md: 0px`, so desktop footer styles are active on mobile.
   - Restore `md` to a real tablet/desktop breakpoint while preserving the requested phone-as-tablet behavior through component-level layout where needed, not global `md:0`.

2. Update `src/components/LuxuryFooter.tsx` only for the footer layout.
   - Mobile wrapper: `block md:hidden`.
   - Desktop columns: `hidden md:grid` or `hidden md:flex`, never visible on mobile.
   - Newsletter appears first on mobile.
   - Footer link groups render as a vertical mobile accordion using the existing Shadcn Accordion primitives.
   - Categories: Services, Company, Get in touch, Legal, Follow Us.
   - Desktop layout remains the existing editorial column grid.

3. Remove the custom mobile disclosure implementation if it is no longer needed.
   - Replace it with Shadcn `Accordion`, `AccordionItem`, `AccordionTrigger`, and `AccordionContent`.
   - Keep RUVTIER’s typography, palette, spacing, and 0.6-stroke visual tone.

4. Verify on the actual mobile viewport.
   - Use the current 440px preview/mobile size.
   - Confirm no horizontal header overlap, newsletter is at the top, and only the vertical accordion rows show on mobile.
   - Confirm desktop columns are hidden on mobile and still present on desktop breakpoints.