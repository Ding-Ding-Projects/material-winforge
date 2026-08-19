# Search and regex builder

## Behavior

The Feature map searches every site feature and documentation article by visible English and Cantonese title, summary, and category. Plain-text search is the default.

An adjacent button opens an anchored builder attached to that exact search field. The builder supports:

- raw JavaScript regular-expression editing
- guided literal, character-class, anchor, group, alternation, and quantifier tokens
- case-insensitive (`i`) and multiline (`m`) flags
- editable sample text
- live match count and capture-group display
- pattern copy and reset

The same query field is used in both modes so switching modes cannot apply hidden state from another search.

## Configuration

The engine is the browser’s JavaScript `RegExp` implementation. Plain text uses locale-aware lowercase substring matching. Regex search applies only when the user deliberately enables regex mode.

## Failure modes

- An invalid expression displays the JavaScript syntax error inline and returns no catalog results.
- An empty query displays the complete catalog.
- No matches show an explicit empty state with a return-to-plain-text suggestion.
- Escape closes the anchored builder and the command palette.

## Security and privacy

Queries and sample text stay in memory and are not transmitted or persisted. Evaluation is bounded to a small built-in catalog and a short user-edited sample. No server evaluation or external regex service is used.

## Verification

Future focused evidence should cover plain text, valid and invalid regex, Unicode, multiline anchors, zero-width patterns, capture groups, no matches, keyboard focus return, narrow layouts, and both themes. Those checks were not run in the initial ultra-speed bootstrap.

## Suggested articles

- [Local preferences](preferences.md)
- [Release downloads](../release/release-downloads.md)
