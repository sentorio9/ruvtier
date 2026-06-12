## Client Lounge drawer — three refinements

All changes scoped to the drawer; no palette, layout, or typography token changes.

### 1. Custom checkbox (replace both natives)

Create a small shared component `LoungeCheckbox` in `src/components/client-lounge/FormElements.tsx`:

- 16×16px square button (`role="checkbox"`, `aria-checked`, keyboard-toggleable via Space/Enter, hidden native `<input>` for form semantics + label `htmlFor`).
- Styling: `border border-border` (same token as inputs), `bg-transparent`, no rounding (matches `--radius: 0`), no browser default — only our `:focus-visible` outline already scoped to `.client-lounge-drawer`.
- When checked: render a foreground-colored check mark (lucide `Check` at size 12, `strokeWidth={1.25}`, `text-foreground`). No fill on the box.
- Label markup left intact, so existing `font-sans text-[11px] text-muted-foreground` styling is preserved.

Replace usages in:
- `ClientLoungeDrawer.tsx` `LoginView` → "Keep me signed in".
- `client-lounge/AddressFields.tsx` → "Billing address same as shipping".

### 2. Register view enhancements (`RegisterView` in `ClientLoungeDrawer.tsx`)

Three additions, all inside the existing form column:

a. **Password helper line** — directly under the Password input (above the `PasswordStrengthIndicator`), one quiet line:
   `Minimum 12 characters` — `font-sans text-[10px] tracking-[0.1em] text-muted-foreground/70 mt-1.5`.
   (Using the real rule from `PasswordStrengthIndicator` rather than the example "8".)

b. **Password visibility toggle** — extend the shared `InputField` in `FormElements.tsx` with an optional `showToggle` prop. When true and `type === "password"`, render an inline button at the right edge of the input wrapper (absolute-positioned inside a `relative` wrapper, padding-right on the input to avoid text overlap). Icon: lucide `Eye` / `EyeOff` at size 14, `strokeWidth={1}`, `text-muted-foreground hover:text-foreground`, `bg-transparent border-0`, `aria-label="Show password" / "Hide password"`. State held locally in `InputField`. Enable only on the Register password field for now (sign-in/reset untouched, per "do not change anything else").

c. **Terms & Privacy notice** — small line directly above the Register button:
   `By creating an account you agree to our` `<Link to="/terms-and-conditions">Terms & Conditions</Link>` `and` `<Link to="/privacy-policy">Privacy Policy</Link>.`
   Style: `font-sans text-[10px] leading-relaxed tracking-[0.05em] text-muted-foreground text-center`; links use `underline underline-offset-2 hover:text-foreground transition-colors`. Use `react-router-dom`'s `Link` (already used elsewhere in the project) and call `onClose` via a passed handler so the drawer closes when the user navigates — wire a new `onNavigate` prop from `ClientLoungeDrawer` into `RegisterView` that invokes the existing `onClose`.

### 3. Editorial anchor at the bottom of the drawer column

In `ClientLoungeDrawer.tsx` footer block (currently just the privacy line), insert a single anchor line **above** the existing border + privacy line, inside `px-8 pb-8`:

```
Concierge — Monday–Sunday — 9–19h
```

Style: same letterspaced-caps as the section labels — `font-sans text-[10px] tracking-[0.15em] uppercase text-muted-foreground text-center mb-4`. Keep the existing `border-t` + "Your privacy is sacred to us" exactly as-is below it, so the column resolves cleanly without altering footer rhythm.

### Files touched

- `src/components/client-lounge/FormElements.tsx` — add `LoungeCheckbox`, extend `InputField` with `showToggle`.
- `src/components/client-lounge/AddressFields.tsx` — swap native billing checkbox for `LoungeCheckbox`.
- `src/components/ClientLoungeDrawer.tsx` — swap "Keep me signed in" checkbox; add helper line, eye toggle (via `showToggle`), and terms/privacy links in `RegisterView`; add concierge line in footer; pass `onClose` down for the legal links.

No changes to auth logic, routes, tokens, or other views.
