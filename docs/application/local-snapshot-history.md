# Local snapshot history and restore

## Behavior

Preview Data lists up to the 50 newest valid local JSON snapshots. Each row shows only its creation time, byte count, theme, language, and route view. The list has its own plain-text search and adjacent guided regex builder. Missing storage produces an honest empty state; unreadable, malformed, oversized, stale, unsupported, and truncated results are disclosed rather than treated as success.

Restore opens a renderer-owned confirmation naming the selected creation time and the presentation state that will be replaced. Cancel, clicking outside, or pressing Escape leaves current state untouched. Confirm first creates a fresh snapshot of the current state. Only after that safety snapshot succeeds does the renderer request and apply the selected theme, language, English and Cantonese tone levels, route, tabs, and bounded tweak switches.

## Privileged boundary

The main process owns the private snapshot directory. Listing accepts no renderer input. Restore accepts one strict generated snapshot identifier and rejects path separators, traversal, malformed identifiers, oversized files, unexpected record keys, invalid dates, and state outside the existing bounded snapshot schema. No shell or network is used. Paths and raw file bytes never cross IPC.

## Failure modes

- A missing directory returns a valid empty list.
- Invalid files are omitted and counted.
- More than 50 valid records sets a truncated-history disclosure.
- A missing or invalid selected record is not applied.
- A failed safety snapshot prevents the restore request.
- Invalid renderer responses leave the current state unchanged and offer retry guidance.

## Verification boundary

The source and unsigned package build may be exercised for this change. Snapshot listing, confirmation, backup, restore, cancellation, and state application remain runtime-unverified until a separate packaged-artifact session drives them. Tests, lint, type checking, installer execution, and screenshots were not part of this ultra-speed slice.
