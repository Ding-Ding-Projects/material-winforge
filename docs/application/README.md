# Application documentation

The current desktop package is a design preview with a bounded set of real privileged integrations. Documentation in this category distinguishes sample controls, implemented behavior, and independently verified runtime evidence.

The Preview Data attestation now identifies both sides of that boundary and reports persistence as local preferences plus private bounded local JSON snapshots. This copy correction is source-verified only.

- [Preview boundary](preview-boundary.md)
- [Unsigned automatic updates](unsigned-automatic-updates.md)
- [Read-only system metrics](read-only-system-metrics.md)
- [External app launch](external-app-launch.md)
- [External editor handoff](external-editor.md)
- [Package engine discovery](package-engine-discovery.md)
- [Global defaults and project overrides](project-settings-overrides.md)
- [App-logo customization](app-logo.md)
- [Personal vocabulary JSON](personal-vocabulary.md)
- [Message emoji preference](message-emoji-preference.md)
- [Scheduled settings and external sources](scheduled-settings.md)
- [Desktop narrator](narration.md)
- [School mode](school-mode.md)
- [Toy locks and Support Tickets](toy-locks.md)
- [Unlock ladder](unlock-ladder.md) — desktop design contract for a bounded waiting aid; never authentication.
- [Built-in authenticator](authenticator.md) — desktop/runtime local TOTP registration, strict URI/Base32 validation, RFC 6238-compatible codes, countdown/search, redacted export, and in-process QR/text registration contract.
- [Local file converter](file-converter.md) — desktop design/runtime counterpart for the bounded offline JSON ↔ CSV/TSV/JSONL batch queue, output validation, pause/resume/cancel outcomes, and truthful adapter catalog.
- [Ollama suite manager](ollama.md) — desktop reference for bounded local health, pulls, chat, reconciliation, and honest unavailable states.
- [Element appearance editor](appearance-editor.md) — matching desktop design-reference editor with typography depth, continuous color/contrast disclosure, presets, local persistence, and explicit unsupported-property behavior.
- [Changelog viewer](changelog-viewer.md)
- [Flush DNS](flush-dns.md)
- [Restart Explorer](restart-explorer.md)
- [Local snapshot](local-snapshot.md)
- [Local snapshot history and restore](local-snapshot-history.md) — private append-only Git metadata where available, browser-local fallback, browsable redacted settings/authenticator/lock events, and safety-snapshot-first restore evidence.
- [Reviewed Winget upgrades](winget-upgrades.md)
- [Empty Recycle Bin](empty-recycle-bin.md)
- [Desktop Status Hub reference](status-hub.md) — evidence-first release and runtime boundary for the design reference.
- [In-app offline documentation browser](offline-documentation.md) — build-time Markdown bundle, local article navigation, plain-text search, and the anchored regex builder.
- [Desktop Export center](export-center.md) — local record-family selection, reviewable bulk selection, and bounded JSON/JSONL/YAML/TOML/XML/CSV/TSV/Markdown/HTML export with privacy omissions.

## Not yet claimed

- Independent runtime verification of the bounded Windows actions
- Destructive-action and package-mutation runtime behavior
- Installer execution and end-to-end update behavior
- Built-artifact accessibility or visual verification
- Published application capture coverage beyond the bounded-live banner and read-only metrics session

These are evidence gaps, not implicit features.
