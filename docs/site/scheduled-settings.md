# Scheduled settings

The Pages surface provides a browser-local scheduled-settings editor. Rules can temporarily override language, both funny-level sliders, theme, tab position, density, accent color, and message emoji. Each rule also records its value source and bounded refresh interval.

## Behavior

- Rules use a bounded version-1 schema, at most 12 rules, strict IDs, local `YYYY-MM-DD` dates, 24-hour `HH:mm` times, 0–6 weekday values, and an allowlist of site setting keys.
- Dates, weekdays, and times are evaluated in the browser's local timezone. Optional date bounds are inclusive. A window whose end time is earlier than its start crosses midnight into the following local day.
- If several enabled rules match, the last matching rule in the Settings list wins. When no rule matches, the settings and Global/project ownership snapshot captured before activation are restored.
- Rules and the editor are stored in bounded browser local storage. The source selector offers Local browser data, HTTPS API, and Home Assistant so the setting's intended source is explicit. Local browser data is the only active source on this landing surface. HTTPS API and Home Assistant are stored as unavailable states because this surface has no privileged network boundary or credential vault; it accepts no URL, token, request, redirect, or remote value.
- Refresh intervals are bounded to 5 minutes, 15 minutes, 60 minutes, or 24 hours. The interval is a persisted scheduling hint, not permission to contact a service. Unavailable sources never match or override settings, and the last valid local/base settings remain recoverable.

## Failure and privacy

Invalid, oversized, duplicate, empty, or out-of-range records are rejected and removed without partial application. If browser storage is unavailable, the page remains usable and says that changes may last only until reload. No schedule payload, path, or remote credential leaves the browser.

## Discovery and verification

The Settings search indexes “Scheduled settings”, including source and availability copy, and `Ctrl+Shift+F` exposes a direct command-palette destination that focuses the card. Runtime interaction, tests, captures, and external-source integrations remain unverified in this source-only lane.

Suggested articles: [Local preferences](preferences.md), [Global defaults and project overrides](project-settings-overrides.md), and [Settings history](settings-history.md).
