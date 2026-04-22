## 2025-04-22 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons like those for 'Play', 'Next Song', 'Mute', 'Close Menu', and user profile do not have ARIA labels or standard accessible name attributes, which degrades screen reader compatibility.
**Action:** Always add explicit `aria-label` attributes to buttons that contain only icons to ensure semantic context.
