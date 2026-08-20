# Export and bulk actions

The site includes an **Export** tab for records the site owns: Global defaults and project overrides, notifications, redacted settings history, redacted local history, and feature metadata. The destination is browser-local and does not upload or send an export.

## Behavior

The first 100 records form the visible page. **Select all this page**, **Invert selection**, and **Clear selection** operate only on that visible page. Counts distinguish visible records from selected records. **Export selected** downloads the selected records and **Copy selected** places the same serialized preview on the clipboard when the browser permits it.

## Formats and configuration

The format picker offers JSON, JSONL/NDJSON, YAML, TOML, XML, CSV, TSV, Markdown, and HTML. Every format is generated from the same schema-versioned redacted record list, with a 512 KiB output bound. Structured formats preserve the record id, collection, label, and allowlisted values; CSV and TSV use a stable union of columns; Markdown and HTML remain readable without requiring this site to reopen them.

## Privacy and omission boundary

The export explicitly omits credentials, password or TOTP hashes, TOTP secrets, QR payloads, personal-vocabulary mappings, source paths, local file bytes, prompts, and remote URLs. Custom logo data is represented only as `present (bytes omitted)`. The site does not read a file path or make a network request to export.

## Failure modes and recovery

With no selected records, download and copy remain disabled. If the serialized output exceeds 512 KiB, the site refuses the operation before creating a download and asks the user to narrow the visible selection. Clipboard denial does not affect download. A browser-storage failure leaves the in-memory records usable for the current visit but does not claim persistence.

## Verification state

This lane verifies source-level bounded selection, serializer coverage, redaction, and local download/copy wiring. Browser interaction, packaged runtime, accessibility tooling, and visual captures remain unverified in this implementation lane.

Suggested articles: [Local site preferences](preferences.md), [Notification history](notifications.md), [Settings history](settings-history.md), and [Search and regex builder](search-and-regex.md).
