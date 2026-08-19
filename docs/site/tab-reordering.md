# Tab reordering

## Behavior

The Pages tab strip and **All tabs** surface provide two keyboard-reachable, at-least-44-pixel move controls on every one of its six known destinations. The control labels and arrow glyphs follow the rendered axis: up/down for left or right docking, and left/right for top or bottom docking and the narrow-width horizontal fallback. A successful move keeps the initiating control focused, does not change the active destination, and announces the moved tab plus its resulting position.

The saved order is shared by the visible strip, the **All tabs** results, and the command palette's destination entries. Pinned tabs continue to render in their stable leading region. Reordering is bounded to the moved tab's current pinned or ordinary region, so a move cannot silently pin, unpin, or cross the region boundary.

This slice does not implement tab groups or bulk close.

## Configuration

The complete permutation of the six identifiers `home`, `features`, `docs`, `settings`, `changelog`, and `status` is stored as `tabOrder` in the existing versioned browser-local Preferences record. Existing records without `tabOrder` migrate to the shipped order. A missing identifier, duplicate identifier, unknown identifier, or incorrect list length invalidates the record and falls back to shipped defaults. Normalization reconstructs the Preferences object from an explicit allowlist, so unknown top-level stored properties are discarded.

## Failure modes

The first or last tab in a region has the corresponding move control disabled. Unavailable or corrupt browser storage restores the shipped order without blocking navigation. Moving a tab never changes the active hash route, dock position, overflow query, regex state, or pin list. Arrow-key navigation derives its origin from the focused tab while retaining the active-tab selection behavior and Home/End semantics.

## Security and privacy

Ordering is device-local presentation state. It makes no network request and stores no credential, path, user content, or operating-system setting.

## Verification

Both Sites and Pages production builds compile this source. No interaction test, browser runtime proof, visual capture, accessibility audit, or review was performed in this bounded lane.

## Suggested articles

- [Local site preferences](preferences.md)
- [Tab overflow discovery](tab-overflow.md)
- [Tab pinning](tab-pinning.md)
