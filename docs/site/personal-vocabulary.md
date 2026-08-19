# Personal vocabulary JSON

## Behavior

The site Settings grid always contains a semantic local JSON picker with no-file, loaded, invalid, replace, and clear states. A valid normalized cache persists inside the existing versioned browser-local Preferences record. Invalid input never partially applies and never replaces the last valid cache. Clear purges the cache and restores shipped wording immediately.

The command palette registers upload/replace, status, and clear destinations. It selects Settings, focuses the stable status target, or opens the semantic picker without changing unrelated Preferences.

## Contract

The site uses the same public version-1 contract as the desktop: at most 64 KiB, exactly `schemaVersion` and `replacements`, at most 256 string entries, key length 1–128, value length 1–256, maximum parser depth 4, and rejection of malformed JSON, duplicate keys, arrays in the schema, unsafe object keys, unknown fields, unsupported versions, control characters, non-string replacements, and trailing content. No real private mapping ships in source or documentation.

## Exact replacement boundary

Exact replacement is limited to **Personal vocabulary**, **Upload dictionary**, **Replace dictionary**, **Clear dictionary**, and the **Vocabulary loaded locally.** toast. URLs, commands, release metadata, checksums, platform names, file facts, manifest facts, accessible names, diagnostics, and public records never pass through replacement.

## Privacy

Selection, reading, parsing, validation, replacement, persistence, and clearing happen locally in the browser. No network request is made. The source path, filename, file metadata, and original bytes are not retained. Exports, release records, logs, and public site content exclude the cache.

## Verification boundary

Source and both site builds may be exercised for this slice. File interaction, every rejection boundary, reload persistence, replacement, clear, palette routing/focus, keyboard access, and rendered labels remain runtime-unverified. Tests, lint, reviews, audits, and screenshots were not part of this ultra-speed lane.
