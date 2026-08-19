# Tab groups

## Behavior

Groups can move up or down from both the rendered headers and Settings. The order is persisted locally, boundary controls disable at the first and last group, and moving a group preserves its members, collapse state, and active tab.

Each group also exposes a bounded **Edit appearance** panel from the strip and Settings. It persists a two-character icon plus text and background colors, applies them live to the group header and preview, and has a per-group reset. Full typography, infinite color translation, and per-state appearance editing remain explicitly separate work.
Each group appearance editor is also indexed by the command palette, which opens the owning Settings card and the exact editor for that group.

The Pages site can create up to eight ordered local groups for its six known destinations. Pinned tabs remain in the stable pinned region. Unpinned members render below a group header; unassigned tabs remain in the ordinary region. Group controls create, rename, recolor, collapse, expand, and remove a group. Removing a group returns its members to the ordinary region.

Each tab exposes **Move… into group…**. The anchored picker lists current groups with their color and member count, offers an ungrouped destination and create-new path, starts with local plain-text search, and provides an adjacent full JavaScript regex builder. Arrow keys traverse choices, Escape cancels, and closure returns focus to the initiating control.

Every rendered group has its own local tab search with an independent anchored JavaScript regex builder. Search state is transient, plain text is the default, and filtering never collapses the group or changes stored membership. The Settings group-management card has a separate group-name/member-count search and builder with an explicit no-match state.

Settings also provides the fourth discovery surface: a separate master-tab search across every tab owned by this site surface. Each result names its group and pinned/ordinary status and focuses the real tab without changing the search, group, or pin state. This site owns one browser surface, so “all windows” is explicitly bounded to that single site instance.

The All tabs surface also provides **Close tabs containing text** and **Close tabs not containing text**. Both actions share the same bounded local query and anchored builder predicate, show the eligible count and a tab-name preview, exclude pinned tabs unless the user explicitly includes them, protect the current tab, and require two acknowledgements plus a full-range slider before closing. Escape, Emergency exit, and scrim cancellation leave the tab state unchanged.

Pinned tabs remain exclusively in the stable pinned region. Pinning a grouped tab removes its group membership, persisted records discard pinned membership during normalization, and move attempts cannot place a pinned tab into a group. Group member counts therefore describe exactly the members rendered in the ordinary region.

## Configuration

`Preferences.tabGroups` uses schema version 2 and stores at most eight ordered records. Generated IDs match `group-[a-z0-9]{8,24}`. Names are trimmed strings from 1–48 characters. Colors are six-digit hex values under the existing accent contract. `collapsed` is boolean. Membership accepts only `home`, `features`, `docs`, `settings`, `changelog`, and `status`, with no tab assigned twice. Each record carries a bounded appearance object with a one- or two-character icon and six-digit text/background colors; schema-version 1 records migrate to the shipped appearance defaults.

Creation and rename share one name validator that rejects blank, overlong, whitespace-altered, and control-character values. An invalid rename restores the last valid visible name and reports the boundary. Identifier generation makes at most eight collision-checked attempts and aborts without mutation if none is unique. Disabled create actions explain whether the name is invalid or the eight-group limit has been reached.

## Failure modes

An unknown or duplicate group ID, unknown or repeated tab ID, invalid color, malformed name, or oversized group list rejects the complete Preferences record and restores shipped defaults. Unknown top-level preference fields are discarded by an explicit allowlist, and raw preferences are bounded before parsing. Invalid picker regex shows inline feedback and produces no guessed matches. If browser storage is unavailable or full, the page remains usable and reports that changes may last only until reload.

## Security and privacy

Group state and picker input remain local to the browser. Group persistence contains no credentials, paths, analytics identifiers, or operating-system data. Picker searches are not persisted or transmitted.

## Verification

This bounded lane compiles the Sites Worker and Pages static export and runs the repository vocabulary, publication, and diff preflights. Source also binds overflow measurement to group-state changes, gives group controls exact localized accessible names/relationships, localizes the picker RegexBuilder, traps focus in the bounded move dialog, and provides at least 44-by-44-pixel group actions. It does not claim tests, lint, browser interaction, accessibility review, visual review, or captures.

Full typography/color translation, per-state appearance editing, cross-window/master discovery searches, and bulk-close actions outside the All tabs surface are explicitly incomplete.

## Suggested articles

- [Local site preferences](preferences.md)
- [Tab pinning](tab-pinning.md)
- [Tab reordering](tab-reordering.md)
- [Rich command palette](command-palette.md)
