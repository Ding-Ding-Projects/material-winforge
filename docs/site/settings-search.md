# Top-level site Settings search

## Behavior

The Pages Settings destination begins with one bounded search across every shipped Settings card: Global/project ownership, language, both tone levels, theme, four-edge tab docking, density, accent, message emoji, personal vocabulary, app logo, and destructive reset. Labels, descriptions, search aliases, and current effective values participate in local matching.

The query is limited to 128 characters and starts in literal, case-insensitive plain-text mode. Filtering changes visibility only. It does not change the active project, effective preferences, nested search state, or persisted values. An honest no-match state explains that current settings remain untouched.

## Full regular-expression builder

The adjacent anchored builder is an explicit opt-in to the browser's JavaScript `RegExp` dialect. It owns this search's query, plain/regex mode, `i` and `m` flags, guided tokens, raw pattern, sample text, syntax feedback, live matches, and capture display. Invalid patterns show their error and yield zero visible Settings cards; they never fall back silently.

Project selection search, Settings history, notification history, changelog, command-palette search, and the feature catalogue keep independent query and builder state.

## Discovery, privacy, and failure modes

The command palette includes a destination that opens Settings and focuses this exact search input. Commands that target a specific Settings control clear the top-level filter before focusing that control, so a stale query cannot hide the destination.

Queries and samples remain in component memory, make no network request, and are not persisted. Closing the builder does not clear the query. Escape closes the builder under the site's shared overlay behavior.

## Verification

Site builds and publication preflight verify compilation and publication boundaries. Runtime filtering, exact focus, assistive-technology announcements, keyboard interaction, narrow layouts, and visual captures remain unverified in this ultra-fast implementation pass.
