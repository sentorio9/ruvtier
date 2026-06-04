I’ll revise the homepage Material section so it matches the attached reference and actually displays the scarf image.

What I will change:

1. **Make the image render reliably**
   - Replace the current asset-pointer path usage with a plain constant URL from the uploaded asset, or use the imported asset safely so the `img src` cannot become empty in the rendered DOM.
   - Add explicit width/height structure around the image so it always has a visible rendered box.

2. **Match the provided reference composition**
   - Keep the section very quiet and minimal, but restore the missing visual block above the “Material is memory” text.
   - Center the image/card above the heading, then keep the heading, body, and “Discover all materials” CTA centered below it.
   - Preserve the RUVTIER luxury spacing, off-white background, serif heading, and text-only button rules.

3. **Remove inaccurate placeholder/editor text**
   - Remove/replace the visible caption text “image crossfades to fabric macro on hover,” because there is no longer a crossfade and it makes the section look unfinished.
   - Keep any image label subtle or hidden if it conflicts with the clean reference.

4. **Verify the fix**
   - Check the live page after the change.
   - Confirm the scarf image request appears in browser network requests.
   - Confirm the Material section screenshot shows the image visibly above the text instead of only blank space.