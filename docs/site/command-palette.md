# Site command palette search

## Behavior

Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> or use the visible Commands control to open the site command palette. Its existing destination and settings actions remain local and unchanged, including Settings history, notification history, personal vocabulary, emoji preferences, search focus, and reset.

Search is literal and case-insensitive by default. It evaluates the combined command label and description without changing command order or behavior.

## Regular expressions

The adjacent anchored builder is an explicit opt-in to the browser's JavaScript `RegExp` engine. It owns the palette query, plain/regex mode, `i` and `m` flags, guided tokens, raw pattern, sample text, syntax feedback, live matches, and capture display. Applying or editing a pattern synchronizes the same query used by palette filtering. An invalid pattern shows its error and returns an honest no-match state; it never falls back to literal matching silently.

## Privacy and failure modes

Queries and samples remain in component memory and are not persisted or transmitted. Search is bounded to the small local command catalogue. Escape closes the palette and builder. A command runs only after its result is explicitly activated.

## Verification

The site builds and publication preflight verify compilation and publication boundaries. Keyboard interaction, focus return, assistive-technology output, narrow-layout behavior, and visual capture remain unverified in this ultra-fast implementation pass.
