## 2025-04-22 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where icon-only buttons like those for 'Play', 'Next Song', 'Mute', 'Close Menu', and user profile do not have ARIA labels or standard accessible name attributes, which degrades screen reader compatibility.
**Action:** Always add explicit `aria-label` attributes to buttons that contain only icons to ensure semantic context.

## 2026-04-27 - Actionable Empty States
**Learning:** Found an empty state for the search functionality that simply stated "No results" without any actionable recovery path. This creates a friction point where users have to manually delete their query to continue.
**Action:** Always provide an actionable path forward in empty states, such as a "Clear Search" button, to reduce user friction and improve the recovery experience.
