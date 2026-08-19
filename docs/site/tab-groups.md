# Tab groups

## Behavior

The Pages site can create up to eight ordered local groups for its six known destinations. Pinned tabs remain in the stable pinned region. Unpinned members render below a group header; unassigned tabs remain in the ordinary region. Group controls create, rename, recolor, collapse, expand, and remove a group. Removing a group returns its members to the ordinary region.

Each tab exposes **Move… into group…**. The anchored picker lists current groups with their color and member count, offers an ungrouped destination and create-new path, starts with local plain-text search, and provides an adjacent full JavaScript regex builder. Arrow keys traverse choices, Escape cancels, and closure returns focus to the initiating control.

## Configuration

`Preferences.tabGroups` uses schema version 1 and stores at most eight ordered records. Generated IDs match `group-[a-z0-9]{8,24}`. Names are trimmed strings from 1–48 characters. Colors are six-digit hex values under the existing accent contract. `collapsed` is boolean. Membership accepts only `home`, `features`, `docs`, `settings`, `changelog`, and `status`, with no tab assigned twice.

## Failure modes

An unknown or duplicate group ID, unknown or repeated tab ID, unexpected field, invalid color, malformed name, or oversized group list rejects the complete Preferences record and restores shipped defaults. Invalid picker regex shows inline feedback and produces no guessed matches.

## Security and privacy

Group state and picker input remain local to the browser. Group persistence contains no credentials, paths, analytics identifiers, or operating-system data. Picker searches are not persisted or transmitted.

## Verification

This bounded lane compiles the Sites Worker and Pages static export and runs the repository vocabulary, publication, and diff preflights. It does not claim tests, lint, browser interaction, accessibility review, visual review, or captures.

Per-group appearance editing, group bulk-close, and the remaining group/window discovery searches are explicitly incomplete.

## Suggested articles

- [Local site preferences](preferences.md)
- [Tab pinning](tab-pinning.md)
- [Tab reordering](tab-reordering.md)
- [Rich command palette](command-palette.md)
