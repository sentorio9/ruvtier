Replace the top-navigation "Book an Appointment" label with "The House" and point it to `/the-house`.

Changes:
1. `src/components/Navigation.tsx`
   - Update `CATEGORY_ROUTES` so the fourth category links to `/the-house` instead of `/appointments`.
   - Use a new translation key `nav.the_house` for the label.

2. `src/i18n/translations.ts`
   - Add `nav.the_house` to the `TranslationKey` union.
   - Add localized "The House" strings to every language dictionary (`en`, `fr`, `de`, `it`, `es`, `pt`, `ja`, `ko`, `zhHant`, `zhHans`, `ar`).
   - Remove or leave `nav.appointments` unused (no other references will remain after the nav change).

No other UI, layout, palette, or route changes.