# Tab pinning

## Behavior

Every one of the six shipped site tabs has a keyboard-reachable pin toggle. Pinning moves the tab into a stable leading region without changing the active destination, panel relationship, or focus order. The command palette exposes the same action for the current tab.

Pinned tabs remain in their dedicated region when ordinary tabs overflow. The main strip labels pinned tabs, and the **All tabs** discovery surface reports **Pinned and protected from bulk close** or **Not pinned** for every result. A dedicated pin action in that surface updates the same state.

## Configuration

The ordered `pinnedTabs` identifier list is stored inside the existing version-1 browser-local Preferences record. Only the six shipped identifiers are accepted, each at most once. Older valid records without the field migrate to an empty list. Resetting all site preferences clears the list with the other shipped defaults.

## Failure modes

An unknown, duplicate, non-array, or oversized pin list invalidates the stored Preferences record and falls back to shipped defaults. Pinning never closes, duplicates, renames, or reorders a tab. If every tab is pinned, the stable region remains locally scrollable rather than silently hiding entries.

## Security and privacy

Pin state contains only shipped tab identifiers. It remains in local browser storage, makes no network request, and contains no account, credential, path, or operating-system data.

## Verification

The Sites and static Pages builds compile this source. Runtime interaction, responsive inspection, keyboard review, accessibility review, and captures were not run in this bounded lane.

## Suggested articles

- [Tab overflow discovery](tab-overflow.md)
- [Local preferences](preferences.md)
- [Command palette search](command-palette.md)
