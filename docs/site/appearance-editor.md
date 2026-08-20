# Element appearance editor

The site exposes a bounded, anchored appearance editor for major feature cards, Settings cards, and navigation tabs. Open it with the pencil action or right-click the element. The editor changes typography basics (family, size, weight), text and surface colors, alpha, and corner radius, then applies the result live.

## Persistence and reset

Values are validated and stored locally under a versioned `localStorage` record. No network, credentials, remote fonts, or source files are involved. `Reset this element` removes only the selected element's override and immediately restores the shipped style.

## Color and disclosure

The editor shows continuous color representations for HEX, RGB, HSL, HSV, HWB, and CMYK. Alpha is explicit. The current bounded implementation labels OKLab as unsupported rather than guessing a conversion. Contrast is disclosed for human review; the editor does not claim an accessibility verdict from a color picker alone.

## Failure and limits

Malformed or out-of-range local records are ignored and the shipped appearance remains active. Font entry is bounded and uses an installed-family/CSS fallback; no remote font is loaded. Built-artifact interaction, focused tests, and captures are not claimed by this lane.

Suggested articles: [App-logo customization](app-logo.md), [Tab groups](tab-groups.md), [Local preferences](preferences.md).
