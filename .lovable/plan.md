## Fix split section snap behavior

Two surgical edits in `src/pages/Index.tsx`:

1. **Line 95** — change the snap container from mandatory to proximity so taller-than-viewport sections can be fully scrolled:
   ```diff
   - <div className="relative md:h-[100svh] md:overflow-y-scroll md:snap-y md:snap-mandatory motion-safe:md:scroll-smooth">
   + <div className="relative md:h-[100svh] md:overflow-y-scroll md:snap-y md:snap-proximity motion-safe:md:scroll-smooth">
   ```

2. **Line 238** — normalize the split section to a full snap stop matching every other section:
   ```diff
   - <section className="md:min-h-[80svh] md:snap-start flex flex-col justify-center bg-background">
   + <section className="md:min-h-[100svh] md:snap-start flex flex-col justify-center bg-background">
   ```

### Out of scope
Image markup, hover behavior, captions, copy, other sections, tokens, DB.

### Verification
At 1303×890, scroll Theia → split: section fully visible (both images + captions), continues cleanly to next section.
