# Local snapshot history and restore

## Behavior

Preview Data lists up to the 50 newest valid local JSON snapshots. Each row shows only its creation time, byte count, theme, language, and route view. The list has its own plain-text search and adjacent guided regex builder. Missing storage produces an honest empty state; unreadable, malformed, oversized, stale, unsupported, and truncated results are disclosed rather than treated as success.

Restore opens a renderer-owned confirmation naming the selected creation time and the presentation state that will be replaced. Cancel, clicking outside, or pressing Escape leaves current state untouched. Confirm first creates a fresh snapshot of the current state. Only after that safety snapshot succeeds does the renderer request and apply the selected theme, language, English and Cantonese tone levels, route, tabs, and bounded tweak switches.

New state schema version 3 snapshots additionally contain the effective emoji-decoration preference and an exact version-2 ownership block: five global defaults, at most 50 validated user-project records, sparse allowlisted overrides, and a null or known active-project identifier. The main process and renderer independently validate all keys, values, counts, IDs, names, and effective-value consistency. A valid schema-version 3 restore applies presentation and ownership atomically. Legacy schema-version 1 snapshots restore presentation only; schema-version 2 ownership migrates the new preference to its shipped default.

## Revision journal

If an existing `git.exe` is found through bounded executable discovery, each successful snapshot creation appends one redacted metadata record to a Git repository under private application data. The journal contains the generated snapshot identifier, creation time, byte count, theme, language, and route view—not the raw snapshot state. It uses fixed local `git init`, `git remote`, `git add`, and `git commit` argument vectors with no shell. A nonempty remote configuration fails the journal operation, and no fetch, push, clone, URL, credential, or network command exists in this path.

When Git is absent, the UI explicitly reports revision journaling as unavailable while snapshot creation, listing, and restore continue. A journal write failure is also non-fatal and visible. Existing history is never amended, reset, rebased, or deleted.

The dedicated revision-journal list reads at most the 50 newest validated local commits through a no-input privileged bridge. It displays only the full commit SHA, ISO timestamp, bounded subject, and generated snapshot identifier, with its own plain-text search and adjacent regex builder. Empty, unavailable, invalid, failed, and truncated states remain explicit. The bridge uses a fixed local `git log` argument vector after confirming that no remote is configured; it returns no paths, raw state, diffs, commit bodies, author identity, environment, or Git output.

Journal rows do not offer restore. Each entry contains metadata only, so restoration continues to use the separately validated snapshot file and its safety-snapshot-first confirmation path.

### Settings, authenticator, and toy-lock mutations

The same private append-only Git journal records settings changes, authenticator entry creation/removal, and toy-lock creation/unlock/relock metadata where the packaged runtime exposes its local Git capability. The design surface exposes these as browsable redacted event metadata with search, date/action filtering, and restore evidence. Restore is always a new `restored` event; history is never rewritten, and a redacted event cannot restore raw state. Subjects are neutral and redacted: passwords, hashes, TOTP secrets, QR payloads, personal-vocabulary data, and credential metadata are excluded from snapshots, exports, and journal records.

The browser landing surface cannot execute Git. It uses a bounded browser-local append-only journal fallback and exposes that capability boundary in Settings instead of claiming Git-backed history.

## Privileged boundary

The main process owns the private snapshot and journal directories. Listing accepts no renderer input. Restore accepts one strict generated snapshot identifier and rejects path separators, traversal, malformed identifiers, oversized files, unexpected record keys, invalid dates, and state outside the existing bounded snapshot schema. The renderer supplies no Git path, command, arguments, identity, remote, or environment. No shell or network is used. Paths, credentials, raw snapshot bytes, and journal contents never cross IPC.

## Failure modes

- A missing directory returns a valid empty list.
- Invalid snapshot files and journal entries are omitted and counted.
- More than 50 valid records sets a truncated-history disclosure.
- A missing or invalid selected record is not applied.
- A failed safety snapshot prevents the restore request.
- Invalid renderer responses leave the current state unchanged and offer retry guidance.

## Verification boundary

The c144163 packaged artifact verified snapshot creation, journal entry/listing, Light alteration, restore confirmation, safety-snapshot-first execution, schema-version 2 ownership restore, and return to the recorded Dark project state. Schema-version 3 emoji ownership, legacy migration, Git absence, configured-remote refusal, bounded journal parsing/search variants, schema-version 1 compatibility, malformed/timeout paths, cancellation, tests, lint, type checking, installer execution, and screenshots remain unverified.
