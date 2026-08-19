# Site command palette search

## Behavior

Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> or use the visible Commands control to open the site command palette. Its existing destination and settings actions remain local and unchanged, including Settings history, notification history, personal vocabulary, emoji preferences, search focus, and reset.

The existing site Settings also render as real inline controls in their result rows: language, separate English and Cantonese funny levels, theme, four-edge tab docking, density, accent color, decorative message emoji, and the shipped app-logo preset. The reset row closes the palette before transferring modal ownership to the same destructive confirmation used by the Settings card. Each inline control calls the same setting function as its owning card, so browser persistence, Global/project ownership, settings history, and non-blocking notifications stay on one path. Operating a non-reset inline control keeps the palette open and leaves unrelated settings unchanged.

Logo preset, custom-logo upload, and logo reset share one bounded history-aware mutation path. Version 2 Settings-history records retain the allowlisted preset and the already validated local PNG/JPEG data URL, capped by the same 360,000-character cache boundary. They never retain a source path. Restore reapplies the logo with the eight presentation values and project ownership; Markdown export reports whether private logo bytes exist but omits those bytes. Personal vocabulary remains excluded.

Each rich result retains a separate destination action. Settings destinations clear any filter that could hide the owner, open Settings, scroll to the exact owning card, and focus it. Other commands retain their visible action-specific label and detail instead of being described as Settings-card routes.

Tab grouping adds two factual commands: **Manage tab groups** teleports to the owning Settings card, and **Move current tab into group** opens the same anchored searchable picker used by the tab strip. The picker and its full RegexBuilder follow the active site language. Neither command invents a second group state or moves pinned tabs out of their stable region.

Search is literal and case-insensitive by default. It evaluates the combined command label and description without changing command order or behavior.

## Regular expressions

The adjacent anchored builder is an explicit opt-in to the browser's JavaScript `RegExp` engine. It owns the palette query, plain/regex mode, `i` and `m` flags, guided tokens, raw pattern, sample text, syntax feedback, live matches, and capture display. Applying or editing a pattern synchronizes the same query used by palette filtering. An invalid pattern shows its error and returns an honest no-match state; it never falls back to literal matching silently.

## Privacy and failure modes

Queries and samples remain in component memory and are not persisted or transmitted. Search is bounded to the small local command catalogue. Escape from the search, selects, sliders, color input, checkbox, and reset control reaches the palette closer. A destination runs only after its result is explicitly activated; inline controls are bounded selects, sliders, a color input, a switch, or the shared reset action.

While the `aria-modal` palette is open, background children are inert, Tab and Shift+Tab remain inside the current focusable controls, and every close path restores the actual opener. Destination focus follows that restoration when a command intentionally teleports. The dialog uses a flex column with a flexible, independently scrolling command list plus an outer vertical-overflow fallback for short, narrow, or high-scale viewports; the anchored RegexBuilder remains attached to its search field.

## Verification

The Sites and Pages builds plus vocabulary/publication/diff preflights verify compilation and publication boundaries. Tests, lint, browser interaction, focus return, assistive-technology output, narrow-layout behavior, and visual capture were not run in this bounded implementation pass.
