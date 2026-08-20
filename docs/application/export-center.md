# Desktop Export center

The desktop design reference now includes an **Export center** route. It is a local review surface for the records this preview actually owns: presentation settings and project ownership, redacted local-history metadata, notification history, and bundled feature-catalog metadata.

## Scope and bulk actions

Each record family is independently selectable. **Select all on page** means the four visible record families only; **Invert selection** and **Clear selection** operate on that same set. The selected count and available count remain visible before an action. Export and copy are bulk actions over the selected families, and an empty selection disables both actions rather than silently exporting everything.

## Formats and bounds

Exports are generated in the renderer from bounded in-memory records. The format picker offers JSON, JSONL/NDJSON, YAML, TOML, XML, CSV, TSV, Markdown, and HTML. JSON and JSONL preserve the validated record shape; YAML and TOML carry bounded JSON text for nested data; XML and HTML escape user-controlled values; CSV and TSV use one row per selected record family with a JSON data column. Markdown is the fallback copy format and includes the scope and disclosure.

## Privacy and failure behavior

The export projection filters keys whose names indicate credentials, passwords, hashes, secrets, QR payloads, private vocabulary, tokens, or paths. The user-facing disclosure names those omissions explicitly. No export control makes a network request, uploads data, persists a source path, or invokes an editor. Browser clipboard denial is reported as a notification and leaves the data available through local download; malformed or empty selection cannot produce a misleading success message.

This is a design-reference implementation. Packaged runtime interaction, tests, accessibility review, and screenshots remain unverified for this slice.

Suggested articles: [Local snapshot history](local-snapshot-history.md), [Notification history](notifications.md), and [Local file converter](file-converter.md).
