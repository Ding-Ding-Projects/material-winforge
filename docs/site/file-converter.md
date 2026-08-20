# Local file converter

The Features surface provides a local-only converter with a 2 MiB byte bound per file. The picker accepts a bounded queue of up to 100 local files, detects JSON, JSONL, CSV, TSV, and text from file bytes, and does not trust an extension alone. The bundled offline adapters convert JSON to CSV/TSV/JSONL and convert CSV, TSV, or JSONL back to JSON.

## Configuration and behavior

Choose the target format, review the bounded preview, then queue conversion. Two workers process the queue at once; pause/resume and cancel are available, and every file receives a converted, skipped, cancelled, or failed outcome. Each successful item downloads one complete Blob only after conversion succeeds. The source is never overwritten. Storage is the browser's configured download destination; this surface does not promise free-space inspection or a custom destination picker.

The adapter catalog lists Documents/PDF, Images, Audio, Video, Archives, Structured Data/Spreadsheets, Code/Text, and Binary Encodings. Its plain-text-first search has an adjacent anchored JavaScript regex builder. JSON ↔ CSV, JSON ↔ TSV, and JSON ↔ JSONL are enabled using bundled in-memory code. Other cards remain visible and state the missing offline adapter rather than pretending PATH tools, a cloud service, or a remote converter exists.

## Failure modes and privacy

Oversized files, malformed JSON/JSONL, CSV or TSV without headers, unknown binary data, and cancelled or failed conversions produce an inline per-file reason and no partial download for that item. TSV cells are flattened to single-line text, and JSONL requires a non-empty JSON array when writing it; these boundaries are disclosed by validation errors. Lossy or unsupported categories remain visibly unavailable; no silent adapter substitution occurs. No network request is made; file contents, paths, and output metadata are not logged, exported, or persisted.

## Verification boundary

The source implementation and documentation are updated in this lane. Tests, lint, runtime interaction, captures, accessibility review, packaging, release, and publication remain unrun for this bounded change.

Suggested articles: [Search and regex builder](search-and-regex.md), [Landing page](landing-page.md).
