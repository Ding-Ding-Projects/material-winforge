# Changelog

## Unreleased — Pages tab-group appearance

- Added a keyboard-accessible, anchored **Edit group appearance…** context-menu action for every Pages tab-group header, with local persistence and per-group reset for icon, text/background colors, corner radius, header size, and header weight. Unsupported gradients, shadows, custom fonts, and color-space translation are disclosed explicitly. Tests, lint, runtime interaction, captures, release, and publication remain unrun for this lane.

## Unreleased — desktop app-logo customization

- Added four bundled desktop logo presets and a local PNG/JPEG picker. The picker checks MIME and magic bytes, caps files at 512 KiB and decoded dimensions at 2048×2048, bounds the local cache, and preserves the previous valid mark on every invalid or undecodable input. The selected logo updates the title bar and Settings preview locally; package identity, installer identity, update feed, and application-data location remain unchanged. Tests, lint, runtime interaction, captures, release, and publication remain unrun for this lane.

## Unreleased — Pages narrator parity

- Extended the Pages narrator with a factual local/network voice label, an explicit unavailable saved-voice option that retains its stable `voiceURI`, a local preview action, and pending-notification replacement while an active utterance finishes. English, Cantonese, bilingual ordering, local persistence, and bounded rate/pitch behavior remain unchanged. No tests, lint, reviews, runtime interaction, captures, or release are claimed for this lane.
- Added the desktop Export center for settings/project ownership, redacted local-history metadata, notifications, and bundled feature records. It supports reviewable select-all-on-page, inverse and clear selection, bulk export/copy, and bounded local JSON, JSONL, YAML, TOML, XML, CSV, TSV, Markdown, and HTML serializers. Credentials, hashes, TOTP secrets, QR payloads, private vocabulary, and source paths are explicitly omitted; no network or editor handoff occurs. Tests, lint, reviews, packaged interaction, and captures remain unrun/unverified for this slice.

- Expanded the local converter catalog from category summaries to individually enumerated formats across Documents/PDF, Images, Audio, Video, Archives, Structured Data/Spreadsheets, Code/Text, and Binary Encodings. Every unavailable format is visibly disabled with its exact missing bundled-adapter reason, while JSON/CSV/JSONL/TSV adapters and bounded queue behavior remain unchanged. Tests, lint, runtime interaction, captures, release, and publication remain unrun for this lane.

## Unreleased — site documentation browser

- Added a Pages Documentation search over article titles, bilingual copy, section headings, body text, and related-article labels. Plain text remains the default; the adjacent anchored builder exposes the JavaScript `RegExp` dialect, flags, guided tokens, sample matches, and inline invalid-pattern recovery.
- Added local article-to-article navigation, bounded browser persistence for the selected article and search mode, and truthful no-article/no-match states. The Pages surface remains local-only; tests, lint, runtime interaction, screenshots, release, and publication remain unrun/unverified for this lane.
- Added the desktop in-app offline documentation browser. Build preparation now validates and bundles every checked-in application and site Markdown article; the Docs route renders escaped Markdown locally, follows internal article links, and searches plain text by default with the shared anchored regex builder. Built-artifact interaction and captures remain unverified for this lane.

- Extended the local appearance editor and desktop design reference with typography weight/style, underline and strikethrough, spacing, line-height, direction/alignment, continuous color fields with alpha and contrast-ratio disclosure, local presets/reset disclosure, and explicit unsupported-property behavior. No network, credentials, remote fonts, or source writes are used. Tests, lint, reviews, runtime interaction, captures, release, and publication remain unrun/unverified for this slice.

- Added guided local Ollama pull and chat operation cards with 30-second/512 KiB bounds, cancellation and explicit no-success-on-timeout behavior; installed-model refresh reconciliation and fixed allowlisted harness previews remain local-only, with no cloud, payment, credential, telemetry, or arbitrary-shell semantics. Tests, lint, packaged interaction, screenshots, release, and publication remain unrun for this lane.
- Added a bounded local waiting aid for toy-lock lockouts: four-choice dim sum, ten easy sums, a timed whack-a-mole rung, and clock-only fallback after a lost round. School mode starts at sums. Expiry, replay, early-submit, attempt-budget, and no-credential/session boundaries are explicit. Tests, lint, reviews, captures, runtime interaction, release, and publication remain unrun/unverified for this slice.
- Extended the local file converter with a bounded multi-file queue (two concurrent workers in the site surface), pause/resume/cancel controls, per-file converted/skipped/cancelled/failed outcomes, browser-download storage disclosure, searchable adapter catalog, anchored JavaScript regex builder state, and explicit unsupported/lossy boundaries. Tests, lint, runtime interaction, screenshots, reviews, release, and publication remain unrun for this lane.

## Unreleased — redacted local Git history

- Added a bounded append-only redacted journal for Settings, authenticator, and toy-lock mutations. The packaged local Git capability may commit neutral metadata privately; restore is a new event, never a history rewrite, and secrets, hashes, QR payloads, credentials, and vocabulary are excluded.
- Added a truthful browser-local append-only fallback when Pages cannot execute Git, with visible capability provenance and no network or credential path.
- Added a browsable local-event panel with literal-first search plus anchored regex construction, ISO date bounds, record-type filtering, redacted restore evidence, and fail-closed downgrade when a packaged bridge append is rejected.
- Tests, lint, reviews, packaged interaction, captures, release, and publication remain unrun/unverified for this slice.
## Unreleased — local Status Hub

- Added an interactive local Status Hub projection to the Pages Status tab: manifest-backed commit/release cards, emoji evidence lanes, accessible filters, expandable lane details, a local-read heartbeat, and a truthful authenticated-delivery-unavailable/copy-for-chat fallback.
- Added matching site and desktop Status Hub documentation, design-reference coverage, and the completeness-inventory row. No remote delivery, credentials, tests, lint, runtime interaction, captures, release, or publication are claimed for this lane.

## Unreleased — toy locks and Support Tickets

- Extended toy locks from four major targets to every rendered target with deterministic exact IDs, independent salted local hashes and durations, a reusable anchored context-menu/keyboard wizard, locked target palette discovery, and preserved Support Tickets/recovery. The feature remains local UX-only: no security, encryption, network, or deletion. Tests, lint, reviews, captures, and release remain unrun for this slice.
- Added a bounded local UX lock wizard for major site and desktop targets with independent salted credential hashes, unlock durations, relock, locked-state discovery, and self-service recovery copy.
- Added fictional local Support Tickets that never contact a service or delete local data.
- Runtime interaction, tests, lint, captures, and packaged verification remain unverified for this slice.

## Unreleased

- Added an anchored, per-element appearance editor for major Pages cards and tabs, with bounded local persistence/reset, typography basics, continuous HEX/RGB/HSL/HSV/HWB/CMYK representations, alpha and contrast disclosure, and explicit unsupported OKLab copy. The desktop design reference carries a matching local editor preview. Tests, lint, reviews, packaged interaction, and captures remain unrun for this slice.

- Added a local file converter surface with 2 MiB byte-bounded JSON/CSV/TXT detection, categorized adapter catalog, offline JSON ↔ CSV conversion, preview, progress, cancellation, atomic browser download, and truthful unavailable-adapter reasons. Runtime interaction, tests, lint, captures, release, and publication remain unrun for this lane.

- Add a bounded local built-in authenticator to the Pages shell and desktop design reference. It accepts validated TOTP `otpauth://` URIs or Base32 secrets, computes RFC 6238-compatible HMAC codes locally, shows a live countdown, supports search and command-palette routing, offers redacted ordinary export plus explicit clear/remove actions, and renders a bounded in-process QR with a copyable URI text alternative. No QR service or new network dependency is added.

## Unreleased

- Added the desktop narrator counterpart: opt-in local notification speech, English/Cantonese/bilingual serialization, runtime voice enumeration with stable IDs, automatic and missing-voice fallback, bounded rate/pitch controls, local persistence, Settings search, and command-palette routing. Tests, lint, packaged runtime interaction, accessibility review, and captures remain unrun for this slice.

- Added local, user-renamable School mode to the Pages shell and desktop design/runtime surface: salted Web Crypto unlock hashes, immediate English-only presentation, hidden funny-level/personal-vocabulary/dim-sum affordances while enabled, prior-choice restoration, command-palette discovery, and honest local-storage recovery. Tests, lint, runtime interaction, accessibility review, captures, release, and publication remain unrun for this slice.

- Added a bounded browser-local scheduled-settings editor with local-time date, time, and weekday matching, deterministic last-match precedence, temporary overrides that restore base ownership/settings, Settings search and command-palette routing, and explicit no-external-source disclosure.
- Added the desktop Scheduled settings editor with bounded local rules, local-time date/time and weekday matching, deterministic priority, temporary override restoration, and explicit unconfigured HTTPS API/Home Assistant credential boundaries. Tests, lint, packaged interaction, and captures remain unrun for this slice.

- Added an opt-in browser-local narrator Settings card with English, Cantonese, and serialized bilingual speech, runtime voice enumeration by stable voice ID, bounded rate and pitch controls, unavailable-browser reporting, and automatic fallback when a saved voice is not installed.
- Added the separate master-tab search in Settings with its own bounded query/regex builder, contextual group and pinned-state results, and exact tab focus routing.
- Added bounded per-group appearance editing from the strip and Settings: a persisted icon, text color, background color, live preview, and per-group reset, with full typography/color translation remaining explicitly separate.
- Added one command-palette destination per group appearance editor, targeting the owning Settings card without sharing editor state between groups.
- Fixed the published Pages first render to hydrate from the build-time release manifest, so an already-published installer is not briefly shown as unavailable before client JavaScript starts.
- Added persisted up/down group-order controls in the tab strip and Settings with localized 44-pixel targets and boundary-aware disabled states.

- Added independent plain-text-first tab searches with anchored JavaScript regex builders inside every rendered group and a separate group-management search in Settings; filtering is transient and preserves membership and collapse state.
- Added All tabs bulk-close actions for containing/not-containing text with a shared bounded predicate, pinned-tab opt-in, current-tab protection, reviewable previews, and two-key/full-slider confirmation.

- Repaired Pages tab groups so overflow measurement follows group state, group names share strict validation, generated IDs retry collisions safely, pinned tabs cannot retain hidden group membership, group controls expose complete localized relationships and 44-pixel targets, picker RegexBuilder copy follows the active language, and disabled creation explains its blocker.
- Hardened the tab-group repair with atomic group insertion, known-group checks, canonical colors, modal picker focus containment and Escape recovery, named search controls, narrow scroll reachability, 44-pixel picker controls, bounded preference/history storage, safe browser-storage degradation, 1–5 tone normalization, and an allowlisted preference root.
- Added bounded schema-versioned Pages tab groups with persistent names, colors, collapsed state, six-tab membership, localized group management, and a searchable anchored Move… into group… picker; per-group appearance editing and group bulk-close remain incomplete.
- Added real inline controls to Pages command-palette results for all existing app-wide presentation Settings, reusing the Settings cards' persistence, history, and notification paths while retaining exact owning-card teleport.
- Repaired the rich Pages command palette with bounded logo history and restore, Escape propagation, correct reset modal transfer, truthful destination semantics, focus containment/opener restoration, background inerting, and short-viewport scrolling.
- Repaired Pages tab reordering with allowlisted preference persistence, focused-tab arrow navigation, overflow move controls, localized accessible names and positional announcements, and 44-pixel reorder targets.
- Added persisted local ordering for the six Pages destinations, with axis-aware keyboard-accessible move controls, stable pinned-region boundaries, focus preservation, and current-order All-tabs and command-palette results; groups and bulk close remain outside this slice.
- Added persisted local tab pinning for the six Pages destinations, including keyboard-reachable strip and overflow actions, a stable pinned region, clear protected-state labels, and command-palette control; reordering, groups, and bulk close remain outside this slice.

- Added measured Pages tab overflow for the existing six destinations, with a bounded local all-tabs surface, plain-text-first search, and an independent anchored JavaScript regex builder; reordering and grouping remain outside that slice.

- Added a bounded top-level Pages Settings search covering every shipped Settings card, with literal matching by default, an independent anchored full regex builder, honest no-match state, and exact command-palette focus routing.

- Extended Pages tab docking to all four edges with persisted real layouts, rendered ARIA orientation, axis-correct keyboard navigation, localized Settings selection, command-palette routing, and a compact narrow-width fallback.

- Added Pages app-logo customization with three existing-brand presets, bounded byte-verified local PNG/JPEG loading, persistent live site rendering, truthful failure states, and command-palette destinations.

- Protected the Pages Settings reset and its command-palette route with one blocking, localized two-acknowledgement and full-slider confirmation that preserves personal vocabulary and records completion in Settings history.

- Added command-palette search parity on the Pages site: literal search remains the default, while an adjacent full regex builder owns explicit mode, flags, samples, matches, and invalid-pattern feedback.

- Added bounded browser-local Settings history for the eight site preferences and Global/project ownership, with dedicated search, ISO date and action filters, Markdown export, and confirmed append-only restore.

- Added a persistent, schema-versioned Pages notification center with an unread count, bounded local history, dedicated plain-text/regex search, accessible bulk selection and dismissal, and filtered Markdown export.

### Fixed

- Restrict the release workflow's push trigger to `main`, preventing each generated release tag from recursively starting another release.
- Replaced the stale all-sample top banner with exact bounded-live, remaining-preview, and runtime-unverified disclosures.
- Corrected the Preview Data attestation so its mode, actions, and persistence rows no longer contradict the bounded integrations or local snapshot storage.

All notable project changes are recorded here. Dates use ISO 8601 and entries link to commits once the repository has published history.

## Unreleased

### Added

- Initial WinForge · Material 3 Preview Electron source and offline local-asset direction.
- One-route Material Design 3 landing and documentation site built with vinext and the Sites adapter.
- Local English, playful Hong Kong-style Cantonese, and bilingual site language modes.
- Independent English and Cantonese tone controls, theme, density, accent, and docked-tab preferences.
- `Ctrl+Shift+F` command palette and plain-text-first catalog search with an anchored JavaScript regex builder.
- Versioned release-manifest contract that keeps installer actions disabled until a real published asset is identified.
- Deterministic social-card generation from the upstream WinForge SVG brand source.
- Categorized documentation, wiki source, roadmap, handoff, contribution, security, and licensing records.
- Startup, six-hour background, and manual checks for unsigned Squirrel updates through the privileged main process.
- Persistent localized update states and actions covering available, downloading, ready, offline, invalid metadata, corrupt package, cancellation, deferred restart, unsaved-work pause, failure, and rollback guidance.
- Side-effecting release workflow without cancellation concurrency.
- Read-only CPU, memory, app-data disk, network-interface, and uptime metrics over a validated no-input IPC bridge, replacing random dashboard telemetry.
- Fixed-ID installed-app discovery and launching through bounded no-shell `where.exe` calls and `shell.openPath`, with truthful missing, timeout, cancellation, duplicate, and failure states while install chains remain preview-only.
- Replaced the dashboard's fabricated DISM success notice with a validated read-only metrics summary that explicitly reports no component-store scan or operating-system mutation.
- Replaced static package-engine availability claims with fixed-candidate, bounded no-shell discovery and made queue execution an explicit no-mutation preview.
- Wired the dashboard Flush DNS action to fixed `ipconfig.exe /flushdns` execution with bounded no-shell IPC results, while visibly retaining every other quick action as preview-only.
- Added confirmed Restart Explorer execution with fixed bounded `taskkill.exe` and `explorer.exe` calls, truthful retry states, and an explicit unsaved-File-Explorer-work warning.
- Added bounded append-only local JSON snapshots with exact state schema, atomic unique writes, Windows rename retries, and no path or host-data exposure.
- Added reviewed sequential Winget upgrades for three explicitly updatable allowlisted IDs, with fixed arguments, bounded progress, cancellation, completed-item queue removal, and retryable per-item results.
- Added a real Windows-only Empty Recycle Bin action behind two independent acknowledgements and a full-range authorization slider, with bounded no-input execution and truthful completion or retry states.
- Added bounded local snapshot history with private metadata listing, dedicated search and regex builder, safety-snapshot-first restore, strict state validation, and truthful invalid, empty, stale, truncated, and retry states.
- Added an optional append-only private Git revision journal for redacted snapshot metadata, using only discovered local `git.exe`, fixed no-shell commands, remote refusal, and explicit unavailable or failed states.
- Added a read-only, no-input snapshot-journal history bridge and dedicated searchable list for up to 50 validated local commit summaries, with no restore action because the journal contains metadata only.
- Added local global defaults and user-created project settings with sparse overrides for theme, language, and both tone levels, including inheritance counts, live application, and project reset.
- Added a dedicated bounded project-picker search and adjacent regex builder with selection-preserving local filtering and distinct no-project versus no-match states.
- Added schema-version 2 snapshots with bounded global/project settings ownership and atomic restore, while retaining schema-version 1 presentation-only compatibility.
- Added a top-level bounded Settings search and anchored regex builder with section filtering, command-palette routing, and a selection-preserving no-match state.
- Formalized the desktop global/project preference allowlist as theme, language, and both tone levels; documented why persisted session, content, operational, and unimplemented appearance fields are excluded.
- Added a local-only version-1 personal-vocabulary JSON picker with strict bounded validation, duplicate-key rejection, persistent replace/clear states, command-palette routing, and five explicitly wired Preview Data strings.
- Added a persisted Show-emojis preference to desktop global/project ownership and site Preferences, with aria-hidden decoration limited to notifications, snackbars, and site status surfaces.
- Added the strict local personal-vocabulary JSON cache to the site Settings grid, with semantic load/replace/clear controls, last-valid-cache preservation, palette destinations, and five exact site-authored strings.
- Added factual desktop and site changelog viewers for published `v1.0.31`–`v1.0.35`, with exact commit links, bounded text/regex/date filtering, local copy, and Markdown export.
- Added site Global defaults and max-50 user-created local project overlays across all eight existing presentation preferences, with sparse inheritance, picker search/regex, switching, and reset.
- Verified packaged Settings search, no-match copy, regex-builder surface, palette discovery, and the corrected Funny-level section route after fixing one query mismatch.
- Verified the packaged Global/project Settings flow on two fresh hidden desktops: create, Light override, Global defaults, reset-to-global, and same-profile persistence; snapshot-v2 restore remains unverified.
- Verified the packaged snapshot-v2 seam: create and journal listing, Light alteration, safety-first confirmation, restore, and return to the recorded project ownership state.
- Verified packaged read-only integrations: live metrics summary with no-OS-change disclosure and real package-engine discovery with Available, Not installed, and Unavailable states; mutation queues remained Preview-only.

### Verification boundary

- `npm --prefix pages run build:sites` completed under Node 22.23.2 after the exact Sites project record was configured.
- `npm --prefix pages run build:pages` completed under Node 22.23.2, statically prerendering `/` into `pages/dist/client` with zero skipped routes.
- A fresh cheap headless session launched the packaged `b52cf34` artifact, resolved one `Chrome_WidgetWin_1` product window, visually confirmed the repaired bounded-live banner, rendered real CPU, memory, app-data-disk, and network values, clicked the read-only metrics summary, and closed the owned process tree and hidden desktop. The first `c0a5d72` runtime capture had exposed the stale banner that `b52cf34` repaired.
- Tests, lint, runtime interaction, installer execution, visual review, and screenshots were not part of the initial ultra-speed bootstrap.
- Added a local-only Ollama suite-manager surface with bounded loopback version and installed-tag reads, explicit stopped/offline/error states, plain search plus an anchored JavaScript regex builder, and honest refusal to claim cloud, payment, arbitrary-shell, or hardware-fit behavior. Tests, lint, packaged interaction, screenshots, release, and publication remain unrun for this lane.
- Extended the offline file converter with byte-detected JSONL and TSV inputs plus bundled JSON ↔ JSONL/TSV adapters. JSONL array requirements, TSV single-line cell normalization, output validation, unchanged source boundaries, and unavailable PDF/image/audio/video/archive/binary categories remain explicit. Tests, lint, runtime interaction, screenshots, reviews, release, and publication remain unrun for this lane.
- Added a bounded desktop external-editor handoff: fixed Visual Studio Code and Notepad++ discovery, private selected-editor persistence, absolute file/folder validation, no-shell opening for projects and exported files, and truthful unavailable/not-installed/launch-failure states. The site remains a landing/documentation surface and does not claim operating-system editor access. Tests, lint, packaged runtime interaction, editor launch, accessibility review, captures, release, and publication remain unrun for this lane.
## Unreleased — desktop authenticator parity

- Added bounded desktop/runtime TOTP state with strict `otpauth://totp/` and Base32 validation, RFC 6238-compatible local HMAC codes for SHA-1/SHA-256/SHA-512, 6/8 digit output, and 15–120 second countdowns.
- Added issuer/account search, remove/clear, redacted JSON export, command-palette/settings discovery, and transient in-process QR/text registration state without network or credential-vault claims.
