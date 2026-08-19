# Personal vocabulary JSON

## Behavior

Preview Data always shows a semantic local JSON file picker. With no file, shipped wording remains unchanged. A valid file is cached in the existing browser-local application state and survives reload. The same control becomes **Replace dictionary** after load; **Clear dictionary** purges the cache and immediately restores shipped wording. Invalid input is rejected without partially applying it or replacing the last valid cache.

The command palette registers upload/replace, status, and clear destinations. Existing Preview Data search and anchored regex controls remain unchanged.

## Version 1 contract

The complete file is at most 64 KiB and has exactly these fields:

```json
{
  "schemaVersion": 1,
  "replacements": {
    "Original app-authored label": "Private local replacement"
  }
}
```

`replacements` contains at most 256 entries. Keys are 1–128 characters and values are nonempty strings of at most 256 characters. Control characters, unsafe object keys (`__proto__`, `prototype`, `constructor`), duplicate keys at any object level, arrays, malformed JSON, unknown top-level fields, unsupported versions, excess nesting, non-string replacements, and trailing content are rejected.

## Exact replacement boundary

This slice applies exact replacements only to five app-authored Preview Data strings: **Preview Data**, **Personal vocabulary**, **Upload dictionary**, **Replace dictionary**, and **Clear dictionary**. It does not rewrite paths, commands, identifiers, logs, snapshot/journal metadata, project names, package or system facts, external content, notifications, exports, public records, accessible diagnostics, or any other surface. Unmatched keys are safely retained in the local cache but have no effect.

The bounded coverage is deliberate and remains incomplete relative to the universal all-copy contract. Later expansion must name and fully wire each additional app-authored boundary rather than applying blind text replacement.

## Privacy and persistence

Reading, parsing, validating, applying, replacing, and clearing happen in the renderer with no network request and no main-process path access. The source path, filename, file metadata, and original bytes are not persisted. Only the normalized validated schema and replacement strings enter browser-local storage. Snapshots, revision journals, logs, notifications, commands, exports, and public repository records exclude the cache.

## Verification boundary

The source and unsigned package may be built for this slice. File selection, duplicate-key rejection, every size/schema bound, persistence across reload, replacement, clear, command-palette focus, keyboard operation, and the five-string rendering boundary remain runtime-unverified. Tests, lint, reviews, audits, installer execution, and screenshots were not part of this ultra-speed lane.
