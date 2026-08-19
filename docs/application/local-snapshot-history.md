# Local snapshot history and restore

## Behavior

Preview Data lists up to the 50 newest valid local JSON snapshots. Each row shows only its creation time, byte count, theme, language, and route view. The list has its own plain-text search and adjacent guided regex builder. Missing storage produces an honest empty state; unreadable, malformed, oversized, stale, unsupported, and truncated results are disclosed rather than treated as success.

Restore opens a renderer-owned confirmation naming the selected creation time and the presentation state that will be replaced. Cancel, clicking outside, or pressing Escape leaves current state untouched. Confirm first creates a fresh snapshot of the current state. Only after that safety snapshot succeeds does the renderer request and apply the selected theme, language, English and Cantonese tone levels, route, tabs, and bounded tweak switches.

## Revision journal

If an existing `git.exe` is found through bounded executable discovery, each successful snapshot creation appends one redacted metadata record to a Git repository under private application data. The journal contains the generated snapshot identifier, creation time, byte count, theme, language, and route view—not the raw snapshot state. It uses fixed local `git init`, `git remote`, `git add`, and `git commit` argument vectors with no shell. A nonempty remote configuration fails the journal operation, and no fetch, push, clone, URL, credential, or network command exists in this path.

When Git is absent, the UI explicitly reports revision journaling as unavailable while snapshot creation, listing, and restore continue. A journal write failure is also non-fatal and visible. Existing history is never amended, reset, rebased, or deleted.

## Privileged boundary

The main process owns the private snapshot and journal directories. Listing accepts no renderer input. Restore accepts one strict generated snapshot identifier and rejects path separators, traversal, malformed identifiers, oversized files, unexpected record keys, invalid dates, and state outside the existing bounded snapshot schema. The renderer supplies no Git path, command, arguments, identity, remote, or environment. No shell or network is used. Paths, credentials, raw snapshot bytes, and journal contents never cross IPC.

## Failure modes

- A missing directory returns a valid empty list.
- Invalid files are omitted and counted.
- More than 50 valid records sets a truncated-history disclosure.
- A missing or invalid selected record is not applied.
- A failed safety snapshot prevents the restore request.
- Invalid renderer responses leave the current state unchanged and offer retry guidance.

## Verification boundary

The source and unsigned package build may be exercised for this change. Git discovery, journal initialization, remote refusal, append-only commit creation, unavailable/failure rendering, snapshot listing, confirmation, backup, restore, cancellation, and state application remain runtime-unverified until a separate packaged-artifact session drives them. Tests, lint, type checking, installer execution, and screenshots were not part of this ultra-speed slice.
