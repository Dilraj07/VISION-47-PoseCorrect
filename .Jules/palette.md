## 2025-04-22 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons like those for 'Play', 'Next Song', 'Mute', 'Close Menu', and user profile do not have ARIA labels or standard accessible name attributes, which degrades screen reader compatibility.
**Action:** Always add explicit `aria-label` attributes to buttons that contain only icons to ensure semantic context.

## 2026-04-29 - Missing ARIA Labels on Search Inputs with Placeholders
**Learning:** Found instances where search inputs relied solely on placeholder text for context, lacking explicit labels or `aria-label` attributes. This pattern is problematic because placeholders disappear when text is entered and aren't reliably read by all screen readers, degrading accessibility.
**Action:** Always provide an explicit label (using `<label>`) or an `aria-label` attribute for inputs, especially when using placeholders for visual hints, to ensure consistent screen reader support.
## 2026-05-02 - [Upload Dropzone Accessibility] **Learning:** [Interactive div-based dropzones must have keyboard support (tabIndex, onKeyDown) and ARIA roles to be usable by everyone, not just mouse users] **Action:** [Always ensure that any div acting as a clickable area includes role="button", tabIndex={0}, and an onKeyDown handler for Enter/Space]

## 2026-05-15 - Missing accessibility features on div-based cards and interactive strips
**Learning:** Found an accessibility anti-pattern where custom interactive UI elements like `ExerciseStrip` (a `motion.div`) and mode selection cards (`div`) were acting as buttons but missing native accessibility attributes. This prevented keyboard users from selecting items.
**Action:** Always ensure that `div` or `motion.div` elements functioning as clickable buttons have `role="button"`, proper `tabIndex` (`0` or `-1`), `onFocus`/`onBlur` handlers, and `onKeyDown` handlers for the `Enter` and Space (` `) keys.
