# Local snapshot

## Behaviour

**New local snapshot** creates one append-only JSON snapshot beneath the application's private data directory. It is local, reversible source data for later history work and is not yet a Git-backed revision.

The renderer sends one schema-versioned payload containing only:

- light or dark theme;
- English, Cantonese, or bilingual language mode;
- bounded English and Cantonese funny levels;
- current route view and bounded identifier;
- at most 64 tabs with bounded IDs, labels, and route view/identifier;
- at most 1,500 unique bounded tweak IDs with boolean values.

Notifications, filesystem paths, credentials, host data, update state, system metrics, raw logs, arbitrary objects, and user file contents are excluded. The complete serialized payload is capped at 256 KiB and every object has an exact allowed-key set.

## Atomic storage

The main process creates the private `snapshots` directory, writes a uniquely named temporary file with exclusive creation and user-only file mode, then renames it to a timestamp-and-random final filename in the same directory. Transient Windows rename errors receive six bounded retries over 320 milliseconds. A failed operation removes only its owned temporary file and never replaces an existing snapshot.

The write has a five-second cancellation deadline. IPC returns schema version 1 plus only `created`, `unsupported`, `timeout`, or `failed` and a safe message. It never returns the snapshot path or filename.

## Security and privacy

The operation uses no shell and no network. Validation occurs before directory or file mutation. Duplicate in-progress requests are refused. Snapshot names use a timestamp and cryptographically random bytes; renderer input never controls a path.

## Verification

The accelerated pass built and packaged the Electron application. Tests, actual snapshot creation, timeout/retry behaviour, file inspection, restore, UI interaction, installer execution, and screenshots were not run, so runtime behaviour remains unverified.

## Suggested articles

- [Preview boundary](preview-boundary.md)
- [Read-only system metrics](read-only-system-metrics.md)
Snapshot creation now feeds the bounded local history and restore surface described in [Local snapshot history and restore](local-snapshot-history.md). A restore first creates a new safety snapshot of the current presentation state and stops without applying anything when that backup fails.
