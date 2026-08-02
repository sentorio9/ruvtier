Turn `/the-house` into a dedicated landing hub with four entry points, build a RUVTIER Stay experience page, and add an invitation-led "Visit the House" booking flow that reuses the existing `appointment_requests` table.

Changes:

1. **New `/the-house` hub page**
   - Replace the current manifesto landing with a quiet-luxury hub that presents four section cards: Philosophy, RUVTIER Stay, Journal, Appointments.
   - Each card links to its dedicated route (`/the-house/philosophy`, `/the-house/stay`, `/journal`, `/appointments`).
   - Use refined placeholder copy and existing editorial imagery where possible.

2. **Move manifesto to `/the-house/philosophy`**
   - Relocate the current `TheHousePage` manifesto content to `/the-house/philosophy`.
   - Update internal links and the route registration in `App.tsx`.

3. **Create `/the-house/stay` page**
   - Hero section: "RUVTIER Stay" with an invitation-led visit introduction.
   - "Book a trip to Visit the House" CTA that reveals a booking form.
   - Experience grid with eight cards: Morning breakfast, Private library, Wine cellar, Meet artisans, Garden & mountain walks, Made-to-measure fittings, Styling consultation, Showroom viewing.
   - Each card uses refined placeholder copy consistent with the quiet-luxury tone.

4. **"Visit the House" booking form**
   - Build a form component that submits to the existing `appointment_requests` table with `appointment_type = 'house_visit'`.
   - Fields: full name, email, phone, preferred date, preferred time, party size, experience interests (multi-select), message.
   - Include form protection, validation, and a polished success state.

5. **Admin appointments update**
   - Ensure `AdminAppointments` recognises the `house_visit` type and displays it clearly in the status/type filters.

6. **Routing & sitemap**
   - Register new routes in `App.tsx`.
   - Update `public/sitemap.xml` to include `/the-house`, `/the-house/philosophy`, and `/the-house/stay`.

No changes to the navigation label or palette. The existing top nav "The House" link already points to `/the-house` and will now land on the new hub.