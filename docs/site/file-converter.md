# Local file converter

The Features surface provides a local-only converter with a 2 MiB byte bound. The picker detects JSON, CSV, and text from the file bytes; it does not trust an extension alone. JSON and CSV are previewable and the bundled offline adapter converts JSON to CSV or CSV to JSON.

## Configuration and behavior

Choose the target format, review the bounded preview, then select Convert and download. Conversion runs in memory, reports progress, supports cancellation, and downloads one complete Blob only after conversion succeeds. The source is never overwritten.

The adapter catalog lists Documents/PDF, Images, Audio, Video, Archives, Structured Data/Spreadsheets, Code/Text, and Binary Encodings. Only JSON ↔ CSV is enabled. Other cards remain visible and state the missing offline adapter rather than pretending PATH tools, a cloud service, or a remote converter exists.

## Failure modes and privacy

Oversized files, malformed JSON, CSV without headers, unknown binary data, and cancelled or failed conversions produce an inline reason and no partial download. No network request is made; file contents, paths, and output metadata are not logged, exported, or persisted.

## Verification boundary

The source implementation and documentation are updated in this lane. Tests, lint, runtime interaction, captures, accessibility review, packaging, release, and publication remain unrun for this bounded change.

Suggested articles: [Search and regex builder](search-and-regex.md), [Landing page](landing-page.md).
