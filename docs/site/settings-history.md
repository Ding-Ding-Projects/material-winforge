# Site settings history

## Behavior

The Pages site keeps a separate, schema-versioned browser-local history for Global and project settings changes. It records setting edits, project creation and switching, project reset, full reset, and restore. The newest 100 valid records are retained.

Each record contains a bounded action, ISO timestamp, neutral label, the eight effective site presentation values, and validated Global/project ownership. Personal-vocabulary contents and metadata, paths, credentials, host details, notifications, and arbitrary objects are excluded.

## Find and export

The Settings history dialog has literal case-insensitive search by default and its own adjacent full JavaScript regular-expression builder. Typed ISO from/to dates compose with an action filter derived from actions actually present in history. The current filtered view can be exported as UTF-8 Markdown.

## Restore

Restore uses a blocking confirmation naming the selected revision. Confirmation atomically applies its validated effective settings and ownership while preserving the current personal-vocabulary cache. Restore itself appends a new history event; it does not rewrite earlier records. Cancel or Escape leaves settings unchanged.

## Failure modes and privacy

Malformed, oversized, unsupported, inconsistent, or unknown-field history is rejected as a whole. Missing browser storage produces an honest empty state. Storage failure may leave current-session state usable without persistence across reloads. Everything remains in browser storage and no network request is made.

## Verification

The site builds and publication preflight exercise compilation and publication boundaries. Runtime restore interaction, browser-storage failure injection, accessibility tooling, and visual captures remain unverified in this ultra-fast implementation pass.
