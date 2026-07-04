## Fix cookie banner palette

The `CookieConsent` banner currently uses `bg-foreground` + `text-primary-foreground`, which renders as near-black with stark white text — off-brand versus the site's quiet-luxury off-white (#F6F4F1) / dark grey (#3A3A3A) palette and the tonal treatment used across the footer, drawers, and modals.

### Change

Edit `src/components/CookieConsent.tsx` only. Repaint the banner using existing semantic tokens so it reads like the rest of the site:

- Panel: `bg-background` with `border border-border` and the site's soft shadow (no more solid dark block).
- Title + body: `text-foreground` (serif title unchanged) and `text-muted-foreground` for the description — same hierarchy the footer uses.
- Primary CTA ("Accept all"): filled in `bg-foreground text-background` with `hover:opacity-80` — the site's standard dark-on-cream action, matching drawer primary buttons.
- Secondary CTA ("Essential only"): transparent with `border border-border text-foreground hover:border-foreground`, matching the footer's ghost buttons.
- "Cookie policy" link: `text-muted-foreground hover:text-foreground`, same tracking as today.
- Keep layout, spacing, animation, tracking, and copy exactly as-is.

No other files change. No logic, no new tokens, no palette additions — just swap the hardcoded dark-panel classes for the existing semantic tokens already used throughout the site.
