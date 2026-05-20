## 2025-04-22 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons like those for 'Play', 'Next Song', 'Mute', 'Close Menu', and user profile do not have ARIA labels or standard accessible name attributes, which degrades screen reader compatibility.
**Action:** Always add explicit `aria-label` attributes to buttons that contain only icons to ensure semantic context.

## 2026-04-29 - Missing ARIA Labels on Search Inputs with Placeholders
**Learning:** Found instances where search inputs relied solely on placeholder text for context, lacking explicit labels or `aria-label` attributes. This pattern is problematic because placeholders disappear when text is entered and aren't reliably read by all screen readers, degrading accessibility.
**Action:** Always provide an explicit label (using `<label>`) or an `aria-label` attribute for inputs, especially when using placeholders for visual hints, to ensure consistent screen reader support.
## 2026-05-02 - [Upload Dropzone Accessibility] **Learning:** [Interactive div-based dropzones must have keyboard support (tabIndex, onKeyDown) and ARIA roles to be usable by everyone, not just mouse users] **Action:** [Always ensure that any div acting as a clickable area includes role="button", tabIndex={0}, and an onKeyDown handler for Enter/Space]

## 2024-05-23 - Add accessible names to interactive elements and focus rings
**Learning:** Found multiple icon-only buttons across the application (like EXIT, Navigation elements, Action buttons) that lacked `aria-label` attributes and interactive elements that lacked a clear visual indicator for keyboard navigation focus. Also learned that aria-labels should contain the visible text of the button to support voice dictation users correctly (WCAG 2.5.3).
**Action:** Always provide an `aria-label` attribute on icon-only buttons or buttons where context might be unclear to assistive technologies, and make sure the visible text is included if present. Also, ensure standard `focus-visible` styling is available globally to support keyboard-only users without relying on component-specific focus states.
