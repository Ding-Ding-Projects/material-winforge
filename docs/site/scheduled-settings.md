# Scheduled settings

The Pages surface now provides a browser-local scheduled-settings editor. Rules can temporarily override language, both funny-level sliders, theme, tab position, density, accent color, and message emoji.

## Behavior

- Rules use a bounded version-1 schema, at most 12 rules, strict IDs, local `YYYY-MM-DD` dates, 24-hour `HH:mm` times, 0–6 weekday values, and an allowlist of site setting keys.
- Dates, weekdays, and times are evaluated in the browser's local timezone. Optional date bounds are inclusive. A window whose end time is earlier than its start crosses midnight into the following local day.
- If several enabled rules match, the last matching rule in the Settings list wins. When no rule matches, the settings and Global/project ownership snapshot captured before activation are restored.
- Rules and the editor are stored in bounded browser local storage. The site makes no external API or Home Assistant request; the source selector is intentionally local-only on this landing/documentation surface.

## Failure and privacy

Invalid, oversized, duplicate, empty, or out-of-range records are rejected and removed without partial application. If browser storage is unavailable, the page remains usable and says that changes may last only until reload. No schedule payload, path, or remote credential leaves the browser.

## Discovery and verification

The Settings search indexes “Scheduled settings”, and `Ctrl+Shift+F` exposes a direct command-palette destination that focuses the card. Runtime interaction, tests, captures, and external-source integrations remain unverified in this source-only lane.

Suggested articles: [Local preferences](preferences.md), [Global defaults and project overrides](project-settings-overrides.md), and [Settings history](settings-history.md).
