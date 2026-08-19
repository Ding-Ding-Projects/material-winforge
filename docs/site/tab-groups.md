# Tab groups

## Behavior

The Pages site can create up to eight ordered local groups for its six known destinations. Pinned tabs remain in the stable pinned region. Unpinned members render below a group header; unassigned tabs remain in the ordinary region. Group controls create, rename, recolor, collapse, expand, and remove a group. Removing a group returns its members to the ordinary region.

Each tab exposes **Move… into group…**. The anchored picker lists current groups with their color and member count, offers an ungrouped destination and create-new path, starts with local plain-text search, and provides an adjacent full JavaScript regex builder. Arrow keys traverse choices, Escape cancels, and closure returns focus to the initiating control.

Pinned tabs remain exclusively in the stable pinned region. Pinning a grouped tab removes its group membership, persisted records discard pinned membership during normalization, and move attempts cannot place a pinned tab into a group. Group member counts therefore describe exactly the members rendered in the ordinary region.

## Configuration

`Preferences.tabGroups` uses schema version 1 and stores at most eight ordered records. Generated IDs match `group-[a-z0-9]{8,24}`. Names are trimmed strings from 1–48 characters. Colors are six-digit hex values under the existing accent contract. `collapsed` is boolean. Membership accepts only `home`, `features`, `docs`, `settings`, `changelog`, and `status`, with no tab assigned twice.

Creation and rename share one name validator that rejects blank, overlong, whitespace-altered, and control-character values. An invalid rename restores the last valid visible name and reports the boundary. Identifier generation makes at most eight collision-checked attempts and aborts without mutation if none is unique. Disabled create actions explain whether the name is invalid or the eight-group limit has been reached.

## Failure modes

An unknown or duplicate group ID, unknown or repeated tab ID, invalid color, malformed name, or oversized group list rejects the complete Preferences record and restores shipped defaults. Unknown top-level preference fields are discarded by an explicit allowlist, and raw preferences are bounded before parsing. Invalid picker regex shows inline feedback and produces no guessed matches. If browser storage is unavailable or full, the page remains usable and reports that changes may last only until reload.

## Security and privacy

Group state and picker input remain local to the browser. Group persistence contains no credentials, paths, analytics identifiers, or operating-system data. Picker searches are not persisted or transmitted.

## Verification

This bounded lane compiles the Sites Worker and Pages static export and runs the repository vocabulary, publication, and diff preflights. Source also binds overflow measurement to group-state changes, gives group controls exact localized accessible names/relationships, localizes the picker RegexBuilder, traps focus in the bounded move dialog, and provides at least 44-by-44-pixel group actions. It does not claim tests, lint, browser interaction, accessibility review, visual review, or captures.

Per-group appearance editing, group bulk-close, and the remaining group/window discovery searches are explicitly incomplete.

## Suggested articles

- [Local site preferences](preferences.md)
- [Tab pinning](tab-pinning.md)
- [Tab reordering](tab-reordering.md)
- [Rich command palette](command-palette.md)
