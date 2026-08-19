# Tab overflow discovery

## Behavior

The existing six-destination tab strip is measured in its rendered orientation. When the available width or height cannot contain every tab, an **All tabs** affordance appears and opens a bounded list of all six destinations. Selecting a result activates the same tab and panel used by the strip.

The list has its own search. Plain text is the default; an adjacent anchored builder deliberately enables the browser's JavaScript regular-expression dialect with `i` and `m` flags, guided tokens, sample text, live match count, capture display, invalid-pattern feedback, and reset/copy actions.

## Configuration

Overflow state is derived from rendered size and is not persisted. Search text, regex mode, flags, and sample text remain local component state and reset on reload. Existing left, right, top, and bottom docking preferences remain unchanged; the 760-pixel narrow layout still renders the strip horizontally at the top.

## Failure modes

An invalid expression returns no tab results and displays the browser error without changing the active tab. A valid query with no matches shows an explicit no-match state. If every tab fits, the overflow affordance is absent because no alternate discovery surface is needed.

## Security and privacy

Measurement, filtering, and regular-expression evaluation happen locally against the six shipped tab labels. The surface makes no network request, reads no operating-system data, and persists no query or sample.

## Verification

The Sites and static Pages builds compile this source. Runtime interaction, responsive inspection, accessibility review, and captures were not run in this bounded lane.

## Suggested articles

- [Local preferences](preferences.md)
- [Search and regex builder](search-and-regex.md)
