# Site command palette search

## Behavior

Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> or use the visible Commands control to open the site command palette. Its existing destination and settings actions remain local and unchanged, including Settings history, notification history, personal vocabulary, emoji preferences, search focus, and reset.

The existing site Settings also render as real inline controls in their result rows: language, separate English and Cantonese funny levels, theme, four-edge tab docking, density, accent color, decorative message emoji, and the shipped app-logo preset. The reset row opens the same destructive confirmation used by the Settings card. Each inline control calls the same setting function as its owning card, so browser persistence, Global/project ownership, settings history, and non-blocking notifications stay on one path. Operating an inline control keeps the palette open and leaves unrelated settings unchanged.

Each rich result retains a separate destination action. Activating that action closes the palette, clears any Settings filter that could hide the owner, opens Settings, scrolls to the exact owning card, and focuses it.

Search is literal and case-insensitive by default. It evaluates the combined command label and description without changing command order or behavior.

## Regular expressions

The adjacent anchored builder is an explicit opt-in to the browser's JavaScript `RegExp` engine. It owns the palette query, plain/regex mode, `i` and `m` flags, guided tokens, raw pattern, sample text, syntax feedback, live matches, and capture display. Applying or editing a pattern synchronizes the same query used by palette filtering. An invalid pattern shows its error and returns an honest no-match state; it never falls back to literal matching silently.

## Privacy and failure modes

Queries and samples remain in component memory and are not persisted or transmitted. Search is bounded to the small local command catalogue. Escape closes the palette and builder. A destination runs only after its result is explicitly activated; inline controls are bounded selects, sliders, a color input, a switch, or the shared reset action.

## Verification

The Sites and Pages builds plus vocabulary/publication/diff preflights verify compilation and publication boundaries. Tests, lint, browser interaction, focus return, assistive-technology output, narrow-layout behavior, and visual capture were not run in this bounded implementation pass.
