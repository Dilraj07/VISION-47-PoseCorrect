## 2025-04-22 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons like those for 'Play', 'Next Song', 'Mute', 'Close Menu', and user profile do not have ARIA labels or standard accessible name attributes, which degrades screen reader compatibility.
**Action:** Always add explicit `aria-label` attributes to buttons that contain only icons to ensure semantic context.

## 2026-04-29 - Missing ARIA Labels on Search Inputs with Placeholders
**Learning:** Found instances where search inputs relied solely on placeholder text for context, lacking explicit labels or `aria-label` attributes. This pattern is problematic because placeholders disappear when text is entered and aren't reliably read by all screen readers, degrading accessibility.
**Action:** Always provide an explicit label (using `<label>`) or an `aria-label` attribute for inputs, especially when using placeholders for visual hints, to ensure consistent screen reader support.
## 2026-05-02 - [Upload Dropzone Accessibility] **Learning:** [Interactive div-based dropzones must have keyboard support (tabIndex, onKeyDown) and ARIA roles to be usable by everyone, not just mouse users] **Action:** [Always ensure that any div acting as a clickable area includes role="button", tabIndex={0}, and an onKeyDown handler for Enter/Space]

## 2026-05-02 - Missing ARIA Labels on Icon-Only Social Links
**Learning:** Social media link buttons typically use only icons without text. Leaving them without an `aria-label` attribute makes them inaccessible and confusing to screen reader users, who will just hear "link" without any context.
**Action:** Always add an explicit `aria-label` attribute describing the destination (e.g., "Instagram", "Twitter") for any icon-only social links or `a` tags.
## 2026-05-02 - Missing Keyboard Accessibility on Interactive Divs
**Learning:** Found an interactive `div` (the `ExerciseStrip` in `Dashboard.jsx`) that used `onClick` for interaction but completely lacked keyboard navigation support. Users relying on keyboards could not tab to it or activate it.
**Action:** Always ensure that any `div` acting as a clickable element includes `role="button"`, `tabIndex={0}`, an `onKeyDown` handler to listen for `Enter` and `Space` keys to replicate the click, and `onFocus`/`onBlur` handlers to replicate visual hover effects.
