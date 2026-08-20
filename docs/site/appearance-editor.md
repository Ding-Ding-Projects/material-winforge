# Element appearance editor

The site exposes a bounded, anchored appearance editor for major feature cards, Settings cards, and navigation tabs. Open it with the pencil action or right-click the element. The editor changes font family/size/weight/style, underline and strikethrough, letter and word spacing, line height, direction, alignment, text and surface colors, alpha, and corner radius, then applies the result live.

## Persistence and reset

Values are validated and stored locally under a versioned `localStorage` record. No network, credentials, remote fonts, or source files are involved. Local `Reading`, `Compact`, and shipped-default presets are disclosed before use; `Reset this element` removes only the selected element's override and immediately restores the shipped style.

## Color and disclosure

The editor provides a continuous native color field plus bounded HEX entry and shows HEX, RGBA, HSLA, HSVA, HWB, and CMYK translations with explicit alpha. It reports a contrast ratio for review. The current bounded implementation labels OKLab as unsupported rather than guessing a conversion; gradients, shadows, variable-font axes, and custom underline styles are likewise visible as unsupported and are never silently discarded.

## Failure and limits

Malformed or out-of-range local records are ignored and the shipped appearance remains active. Font entry is bounded and uses an installed-family/CSS fallback; no remote font is loaded. Built-artifact interaction, focused tests, and captures are not claimed by this lane.

Suggested articles: [App-logo customization](app-logo.md), [Tab groups](tab-groups.md), [Local preferences](preferences.md).
