# Desktop local file converter

The desktop design/runtime reference now describes the same local converter contract: bounded byte inspection, a categorized adapter catalog, a bounded multi-file queue, and bundled offline JSON ↔ CSV, JSON ↔ TSV, and JSON ↔ JSONL adapters enabled. The landing site remains a preview and does not claim operating-system file actions.

## Behavior

JSON, JSONL, CSV, and TSV files are selected through a real local picker, previewed, queued, converted in memory with concurrency two, output-validated, and downloaded atomically by the browser surface. Pause/resume/cancel and per-file converted/skipped/cancelled/failed outcomes are explicit. TSV cell newlines are flattened and JSONL requires array input when writing it; malformed or lossy boundaries fail before download. Unsupported categories remain visible with an exact unavailable-adapter reason. No converter is discovered from PATH and no network service is used.

## Security and failure handling

The 2 MiB bound and byte-based detection prevent extension-only trust. Errors, malformed input, and cancellation leave the source unchanged and do not emit a partial result. Contents, paths, and secrets are not logged or exported.

## Verification boundary

This is source/design evidence only. No tests, lint, reviews, packaged runtime interaction, captures, accessibility review, release, or publication were run in this lane.

Suggested articles: [Preview boundary](preview-boundary.md), [Local snapshot history](local-snapshot-history.md).
