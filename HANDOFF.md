# Handoff

## Unlock ladder lane — `codex/luna-unlock-ladder`

- Added the local-only unlock ladder waiting aid to `pages/app/SiteShell.tsx` and `pages/app/globals.css`. It starts at a four-choice dim-sum rung unless School mode is enabled, advances through ten sums and a timed mole round, and falls to clock-only after a lost round.
- Added explicit expiry, nonce refresh, early timed submission, bounded attempt budget, School-mode omission, and waiting-only/no-credential/session disclosure. No network or secret handling is present.
- Added the desktop design-reference copy, categorized site/application docs and indexes, completeness inventory row, and Unreleased changelog entry.
- Tests, lint, reviews, screenshots, packaged runtime interaction, release, and publication are intentionally unrun/unverified for this lane.

## Local redacted Git-history lane — `codex/luna-git-history`

- Added `LocalHistoryJournal` to `pages/app/SiteShell.tsx`. Settings, authenticator, and toy-lock mutations append bounded neutral metadata; restore is recorded as a new event through the existing settings-history path. Secrets, hashes, TOTP material, QR payloads, credentials, and personal vocabulary are excluded.
- When an installed runtime exposes the optional `winforgeGitHistory` bridge, the journal reports Git-backed capability and forwards only redacted event metadata. The Pages browser surface cannot run Git and therefore persists a validated browser-local append-only fallback, with that boundary shown in Settings provenance.
- Updated `main-app-design/WinForge M3.dc.html`, both documentation indexes, the site/application history articles, the universal inventory, and `CHANGELOG.md`.
- No tests, lint, reviews, screenshots, release, or packaged-runtime interaction were run; bridge-backed Git commit behavior and visual/runtime evidence remain unverified.

## Luna local-history parity lane — `codex/luna-history-parity`

- Added a browsable redacted local-event panel in `pages/app/SiteShell.tsx` for settings, authenticator, and toy-lock mutations. It supports literal-first search with an adjacent regex builder, ISO date bounds, action/type filtering derived from stored events, and explicit restore-evidence copy. Redacted events cannot restore raw state; validated settings restore remains the only presentation restore path and appends a new `restored` event.
- Improved optional packaged `winforgeGitHistory` handling so a rejected or failed append downgrades visible provenance to the browser-local fallback instead of treating `available: true` as proof of a committed event. Secrets, hashes, QR payloads, credentials, and personal vocabulary remain excluded.
- Updated the design reference, site/application history articles and indexes, completeness inventory, changelog, and this handoff.
- No tests, lint, reviews, screenshots, release, or packaged-runtime interaction were run. Bridge response-shape behavior, visual parity, runtime browsing, and installer evidence remain unverified.

## Element appearance editor lane — `codex/luna-appearance-editor`

- Added the anchored Pages appearance editor in `pages/app/SiteShell.tsx` and `pages/app/globals.css`. Major feature cards, Settings cards, and tabs expose a pencil action and a right-click path; edits apply live and persist in a bounded localStorage record with per-element reset.
- Added typography basics (family, size, weight, radius), text/surface colors, alpha, and HEX/RGB/HSL/HSV/HWB/CMYK representations. OKLab is explicitly disclosed as unsupported rather than guessed, and contrast is disclosed for review.
- Added the matching desktop design-reference surface in `main-app-design/WinForge M3.dc.html`, categorized docs and indexes, and the universal inventory/changelog entries.
- No network, credentials, remote fonts, or source-file writes are used. Tests, lint, reviews, packaged/runtime interaction, accessibility review, captures, release, and publication remain unrun/unverified for this lane.

## Local file-converter lane — `codex/luna-file-converter`

- Added the bounded Pages converter in `pages/app/SiteShell.tsx` and `pages/app/globals.css`: local picker, byte-based JSON/CSV/TXT detection, 2 MiB bound, preview, offline JSON ↔ CSV adapter, progress/cancel, atomic browser download, and visible unavailable reasons for all other converter categories.
- Added categorized site and desktop documentation, indexes, the universal-feature inventory row, and an Unreleased changelog entry. The desktop design/runtime reference update is in progress in `main-app-design/WinForge M3.dc.html`.
- No file content, path, secret, or converter output is persisted or logged; no network or remote converter is used.
- Tests, lint, reviews, screenshots, packaged runtime interaction, accessibility review, release, and publication are intentionally unrun for this bounded lane.

## Desktop narrator lane — `codex/luna-desktop-narrator`

- Added the desktop narrator card to `main-app-design/WinForge M3.dc.html`: opt-in local notification speech, English/Cantonese/bilingual serialized queue, runtime voice enumeration using stable platform `voiceURI` IDs, automatic and missing-voice fallback, bounded rate/pitch controls, local persistence, Settings search, and `Ctrl+Shift+F` command-palette routing.
- Added `docs/application/narration.md`, its application-documentation index entry, the desktop completeness inventory row, and an Unreleased changelog entry.
- No network request or credential path is used by the narrator. Network-backed platform voices are labelled as a platform fact and are not claimed to work offline.
- Tests, lint, reviews, packaged/runtime interaction, actual voice enumeration, accessibility review, captures, release, and publication are unverified and intentionally unrun for this bounded lane.

## School-mode lane — `codex/luna-school-mode`

- Added local user-renamable School mode to `pages/app/SiteShell.tsx` and `main-app-design/WinForge M3.dc.html`.
- The mode stores only a bounded name, random salt, and Web Crypto SHA-256 credential hash. It forces English-only copy immediately, hides funny-level and personal-vocabulary controls, keeps dim-sum content undiscoverable while enabled, and restores prior choices after a correct local unlock.
- Added `docs/site/school-mode.md`, `docs/application/school-mode.md`, both documentation index entries, and the completeness inventory row.
- Recovery is local browser/app data clearing; this is a UX mode, not security. No credential plaintext is persisted or exported.
- Tests, lint, reviews, packaged/runtime interaction, accessibility review, captures, release, and publication are unverified and intentionally unrun in this bounded lane.

## Scheduled-settings lane — checkpoint `6b33a58`

- Added the browser-local scheduled-settings editor and lifecycle in `pages/app/SiteShell.tsx`, including bounded rule persistence, local-time date/time/weekday semantics, deterministic last-match precedence, temporary override application, restoration of base settings and ownership, Settings search, and command-palette routing.
- Added responsive schedule-editor styling in `pages/app/globals.css` and the categorized article `docs/site/scheduled-settings.md`; updated the site index, completeness inventory, and Unreleased changelog.
- The site explicitly remains local-only: external APIs and Home Assistant sources are not wired on this landing surface.
- No tests, lint, reviews, runtime interaction, captures, release, or publication were run in this lane. A build/preflight result is recorded by the owning agent after integration.

## Release-trigger repair

The release workflow now responds to pushes on `main` and manual dispatch only. The prior bare `push` trigger also matched generated tags, causing releases v1.0.2 through v1.0.4 to start subsequent workflow runs. Run `32213126094` was cancelled while active. The already published releases and tags were preserved because deleting release history was not authorized.

## Current scope

## Built-in authenticator lane — `codex/luna-authenticator`

- Added a bounded local TOTP authenticator to `pages/app/SiteShell.tsx` and responsive styling in `pages/app/globals.css`.
- Added URI/manual Base32 registration validation, SHA-1/SHA-256/SHA-512 HMAC generation, 6/8 digit output, bounded periods, live countdown, local search, per-entry remove, clear-all, command-palette routing, and redacted JSON export that omits secrets.
- Added design-reference coverage in `main-app-design/WinForge M3.dc.html`, categorized articles in `docs/site/authenticator.md` and `docs/application/authenticator.md`, index rows, completeness inventory evidence, and Unreleased changelog text.
- The site uses bounded browser storage rather than a credential vault and explicitly claims convenience, not security. QR rendering is local-only and adds no remote service or network dependency.
- QR follow-up: the Pages shell now renders a bounded version-5 in-process SVG QR for successful registrations, with a copyable `otpauth://` URI text alternative. The transient QR state is memory-only; oversized payloads keep the copyable URI route and report the renderer bound. No network QR service, secret export, or security claim was added. Narrow source/publication/diff preflights only; tests, lint, runtime interaction, QR decoding, captures, accessibility review, packaging, release, and publication remain unrun.
- No tests, lint, reviews, screenshots, runtime interaction, packaging, release, or publication were run. Build and design-template validation remain unverified.

This repository bootstraps **WinForge · Material 3 Preview**: an Electron desktop design preview plus a one-route vinext landing and documentation site. The site is deliberately honest that it is not the installed application and does not change Windows settings.

## Scheduled settings slice

- The desktop Settings design now carries a bounded version-1 local scheduler. It stores up to 50 validated rules for the existing five app-wide settings, uses native local date/time fields and weekday chips, names the resolved timezone, applies deterministic priority to matching rules, and restores Global/project base values when a temporary window ends.
- `local` is the only active source. HTTPS API and Home Assistant choices are visible but explicitly unconfigured; no URL, token, network request, or credential is accepted or persisted. Schedule records remain outside the existing snapshot payload so snapshot restore cannot silently mutate scheduling.
- Documentation and the completeness inventory are updated in `docs/application/scheduled-settings.md`. Tests, lint, packaged runtime interaction, accessibility review, and screenshots are unverified for this slice.

## Implemented source

- Pages now includes a browser-local Narrator Settings card: opt-in speech synthesis, English/Cantonese/bilingual mode, runtime voice enumeration with stable voice IDs, automatic fallback for missing voices, bounded rate/pitch controls, a four-item serialized queue, and explicit unavailable/waiting states. See [`docs/site/narration.md`](docs/site/narration.md).
- The Pages command palette now renders real bounded inline controls for language, separate English and Cantonese funny levels, theme, all four tab edges, density, accent color, message emoji, app-logo preset, and shared confirmed reset. Each control reuses its owning Settings setter; a separate result action clears the Settings filter and focuses the exact owning card.
- Follow-up repairs add version-2 bounded logo snapshots and restore, shared history-aware preset/upload/reset mutations, palette-to-reset modal ownership transfer, Escape propagation from inline controls, action-accurate destination semantics, opener restoration with a contained focus loop and inert background, and flexible nested scrolling for short or magnified viewports. Personal vocabulary and logo bytes in Markdown exports remain excluded.
- Material Design 3 site shell with tabs dockable to the left, right, top, or bottom for Home, Feature map, Documentation, Settings, Changelog, and Status. Vertical and horizontal keyboard direction follows the rendered orientation; narrow widths use a top horizontal fallback without changing the persisted edge.
- Local English, playful Hong Kong-style Cantonese, and bilingual presentation.
- Separate five-level English and Cantonese tone controls.
- Local theme, density, accent, and tab-position persistence with reset.
- `Ctrl+Shift+F` command palette.
- Plain-text-first catalog search with an anchored JavaScript regex builder, flags, sample text, match count, and capture display.
- Versioned `pages/public/release-manifest.json` contract and disabled-until-published installer action.
- Dual build entry points for the Worker bundle and GitHub Pages static export.
- Deterministic byte-identical root and served social images from the upstream brand SVG.
- Categorized feature documentation and wiki source.
- Hand-written universal-feature and checked-in design-reference parity inventories that mark missing source and evidence fail-closed.
- Privileged unsigned Squirrel update checks on startup, every six hours, and manually, with a persistent localized renderer banner and explicit restart/defer actions.
- Read-only system metrics from the privileged main process, with bounded no-input IPC output and explicit unavailable states instead of random CPU, memory, disk, network, and uptime values.
- Fixed-ID external-app discovery and launching through a no-shell main-process bridge; renderer paths and executable names are never accepted, and install chains remain preview-only.
- Empty Recycle Bin now requires two independent impact acknowledgements and a full authorization slider before a fixed, no-input Windows command can run; only bounded status and safe copy return to the renderer.
- The persistent top banner now distinguishes bounded live integrations from sample and preview-only controls, while stating that build and packaging do not establish runtime verification.
- The Preview Data attestation now mirrors that boundary and distinguishes `localStorage` preferences from private bounded local JSON snapshots; this copy repair was discovered and checked in source only.
- Preview Data now lists up to 50 validated private local snapshots and can restore presentation state only after creating a fresh current-state safety snapshot; identifiers, paths, and raw bytes stay behind the main-process boundary.
- Snapshot creation now appends redacted metadata to a private local Git journal when an existing `git.exe` is discoverable. The journal refuses configured remotes, never uses network commands, and degrades visibly without blocking snapshots when Git is absent or journaling fails.
- Preview Data now exposes a separate read-only journal list with its own search and regex builder. The no-input bridge returns at most 50 validated commit SHAs, timestamps, bounded subjects, and snapshot identifiers; it exposes no restore action, paths, diffs, or raw state.
- Site Settings supports validated local Global defaults plus up to 50 user-created, path-free project records with sparse overrides for language, English and Cantonese tone, theme, tab position, density, accent, and decorative message emoji, alongside live effective values, inheritance counts, and reset-to-global. See [`docs/site/project-settings-overrides.md`](docs/site/project-settings-overrides.md).
- The active-project picker has its own bounded plain-text search and anchored regex builder; filtering Global defaults and local projects never changes the active selection, and no-match copy stays distinct from the empty-project state.
- Settings now has a top-level bounded plain-text search and anchored regex builder that filters its four sections locally; command-palette results route to the field or selected section, and filtering never mutates persisted values or active-project selection.
- New schema-version 2 snapshots include validated global defaults, project records, sparse overrides, and active ownership; restore applies ownership and effective presentation together after the safety snapshot. Schema-version 1 snapshots remain presentation-only and preserve current ownership.
- The desktop Settings allowlist now owns five persisted app-wide preferences: theme, language, English tone, Cantonese tone, and decorative message emoji. Renderer persistence and main-process snapshot validation remain aligned; tabs, route, tweaks, notifications, reactor/log/evidence records, plus unimplemented density/accent/tab-position controls remain explicitly outside project inheritance.
- Preview Data now owns a semantic local personal-vocabulary JSON picker with a strict 64 KiB/version-1/256-entry contract, duplicate and unsafe-key rejection, normalized browser-local persistence, replace/clear lifecycle, and command-palette destinations. Exact replacement coverage is intentionally limited to five named Preview Data labels/actions; paths, commands, IDs, logs, facts, snapshots, journals, exports, and public records remain excluded.

## Verification state

- Pages tab-group repair: the nine independently confirmed source findings are addressed, including group-bound overflow measurement, shared strict names, bounded ID collision handling, pin/group coherence, exact counts, localized accessible relationships, picker RegexBuilder localization, 44-pixel targets, and described disabled create states. Sequential Sites/Pages builds and vocabulary/publication/diff preflights are the only requested evidence; tests, lint, reviews, audits, runtime interaction, and captures remain unrun.
- Pages tab-group slice: source now includes strict bounded Preferences normalization, grouped ordinary-region rendering, localized create/rename/remove/collapse/expand controls, command-palette routes, and an anchored searchable Move… into group… picker. Only the sequential Sites/Pages builds and requested vocabulary/publication/diff preflights are in scope; tests, lint, reviews, audits, runtime interaction, and captures remain unrun.
- Rich command-palette Settings slice: Sites and Pages builds plus vocabulary-currency, publication, and diff preflights are the only requested verification. Tests, lint, reviews, audits, runtime interaction, and captures were not run.
- Rich command-palette repair: source compilation through the sequential Sites and Pages builds plus vocabulary-currency, publication, and diff preflights are the only requested evidence; modal and history behavior remains runtime-unverified.
- Tests: not run in the initial ultra-speed pass.
- Lint and static analysis: not run.
- Desktop runtime interaction: one bounded cheap headless session exercised the packaged `b52cf34` banner, live read-only metrics, and metrics-summary action; destructive and package-mutation actions were not invoked.
- Installer execution: not run.
- Visual evidence: the repaired banner and rendered read-only metrics were visually inspected in the fresh hidden-desktop session. Broader surface coverage remains unverified, and no local capture path is published here.
- Worker-target site build: final `npm --prefix pages run build:sites` exited 0 under verified official Node 22.23.2 after the exact returned Sites project identifier was recorded.
- Static GitHub Pages build: final `npm --prefix pages run build:pages` exited 0 under the same runtime, classified `/` as static, prerendered it with zero skipped routes, and wrote `pages/dist/client/index.html` plus `.nojekyll` and local public assets.
- Social assets: `pages/public/og.png` and root `social-preview.png` are byte-identical 1200×630 PNG files with SHA-256 `6720a5713878e429a42a7c02f75aa3c2d0aa7fae053ce634f1e03a122536ea8d`.
- Deployment and release: verified for `3e765b4ca49e7d255a67ee370b10ed7d64b1d9cc` by GitHub Actions run `32238648901`; release `v1.0.20` is non-draft and non-prerelease with the complete unsigned asset set, and the canonical Pages deployment completed successfully.
- Packaged banner and metrics runtime evidence: the `b52cf34` artifact was launched on a fresh hidden desktop, its single product window was resolved by the `Chrome_WidgetWin_1` class, and the repaired bounded-live banner was visually inspected. Real CPU, memory, app-data-disk, and network values rendered, and the read-only metrics summary action was clicked. The owned process tree and hidden desktop were then closed. No destructive action was invoked.
- Packaged project-settings runtime evidence: the c144163 artifact was launched on two fresh hidden desktops with one product window at 1480×940 each time. The first session created `Demo Project`, switched its theme to Light, showed `1 override · 3 inherited`, returned to Global defaults, and reset the project to `0 overrides · 4 inherited`; the second session reused the same isolated profile and showed the project persisted. The unpacked executable SHA-256 was `26973595E06E9440A9EE67095C7E834C53F0AD414F6FFDE90127DC33596BE300`; `resources/app.asar` SHA-256 was `E5614897BABAD8273E92A29235329BB9110FFE917B920FFFD686458A1855AD81`. Both owned process trees and hidden desktops were cleaned. This proves the settings flow only; snapshot-v2 restore and other integrations remain unverified.
- Packaged snapshot-v2 runtime evidence: the same c144163 artifact created a local snapshot and redacted journal entry, changed the active project to Light, opened the safety-first restore confirmation, created the safety snapshot, restored the earlier snapshot, returned to Dashboard dark, and then showed the active `Demo Project` with `0 overrides · 4 inherited`. The owned process tree and hidden desktop were cleaned. This proves the v2 create/list/confirmation/safety/restore seam; schema-version 1 compatibility, malformed records, timeout paths, and other integrations remain unverified.
- Packaged read-only integration evidence: a fresh c144163 session rendered real CPU, memory, app-data disk, and connected-network values; clicking **Read-only metrics summary** produced the factual non-blocking notification with the no-DISM/no-OS-change disclosure. The Packages surface performed bounded engine discovery through the real bridge and rendered Available, Not installed, and Unavailable states with a Preview-only queue. No package-manager or operating-system mutation was invoked; the owned process tree and hidden desktop were cleaned.

## Next owner actions

1. Exercise the packaged or browser Narrator flow with actual voice enumeration, unavailable speech synthesis, missing saved voice fallback, keyboard navigation, and bilingual queue behavior; the source and build are present but runtime interaction remains unverified.
2. Keep future builds pinned to their exact candidate commit and record the resulting release evidence.
3. The private Sites mirror still needs an independently verified deployment; do not infer it from the successful Pages run.
4. Upload `social-preview.png` through **Settings → General → Social preview → Upload an image** and keep this step open until a person confirms it.
5. Schedule separate runtime and capture work; do not reinterpret source builds as installation or visual proof.

## Known limitations

- Most desktop controls remain preview interactions. The banner and feature documentation enumerate the bounded integrations that are implemented while keeping their runtime evidence explicitly unverified.
- The checked-in default manifest is intentionally unavailable; the published Pages build generates a verified manifest for `v1.0.20` from the release record.
- The site uses browser storage rather than an operating-system credential store; it contains presentation preferences only.
- No real built-artifact captures are present yet.
- Node 24.19.0 reproducibly completed vinext output and then aborted during process shutdown on Windows. The site build is pinned to Node 22.23.2, which exited normally for both targets.
- Universal completeness and design-parity rows remain incomplete because the ultra-speed pass intentionally ran no tests, built-artifact interactions, negative regressions, visual audits, or captures.
- The update source and package route are present, but offline, invalid metadata, corrupt package, cancellation, deferred restart, unsaved work, installation, and rollback guidance have not been exercised against a published feed.
- The system-metrics bridge was built and packaged but not exercised in the running artifact; its live values and dashboard rendering remain unverified.
- External-app discovery, actual launch, cancellation, timeout, and duplicate-request behaviour were not exercised in the running artifact.
- The dashboard read-only summary uses the metrics bridge and no longer claims a DISM result; its notification path was built but not exercised in the running artifact.
- Package-engine discovery and its Not checked, Available, Not installed, and Unavailable renderer states were built and packaged but not exercised; Preview queue performs no package mutation.
- Flush DNS is real and uses fixed bounded `ipconfig.exe /flushdns`; it was packaged but not executed.
- Restart Explorer is now also real behind an explicit interruption warning and fixed bounded process calls; it was packaged but neither the confirmation nor Explorer termination/restart was exercised.
- New local snapshot now writes bounded append-only JSON atomically under private app data; it is not yet Git-backed history and creation/restore were not exercised.
- Reviewed Winget upgrades now support only `Git.Git`, `Microsoft.PowerShell`, and `GitHub.cli`; review, execution, progress, cancellation, timeout, and partial queue handling were packaged but not exercised.
- Empty Recycle Bin is a real destructive action behind its own super-confirmation surface; the action, cancellation paths, permanent deletion, and completion state were deliberately not exercised.
- Packaged runtime inspection found the prior top banner still claiming every action was sample-only. The copy was repaired in source and packaged, but the repaired banner was not reopened or visually inspected in the running artifact.
- The first packaged runtime capture at `c0a5d72` exposed the stale all-sample banner. The follow-up `b52cf34` package replaced it, and a fresh cheap headless session visually confirmed the repaired banner and live read-only metrics. This evidence does not verify the destructive or package-mutation actions.
- Source inspection subsequently found stale Preview Data rows still claiming preview-only actions and `localStorage`-only persistence. Their copy was repaired without a new packaged runtime session, so the corrected attestation remains runtime-unverified.
- Snapshot history listing, searching, confirmation, safety backup, restore, and refreshed-state behavior were built but not exercised in the packaged runtime.
- Git discovery, private journal creation, remote refusal, append-only commits, and unavailable/failure states were built but not exercised in the packaged runtime.
- Read-only journal-log parsing, list rendering, search, regex filtering, empty/invalid/truncated states, and remote refusal were built but not exercised in the packaged runtime.
- Global-default editing, project creation and switching, sparse inheritance, live effective values, reset, reload persistence, invalid-record omission, schema-version 1 compatibility, and schema-version 2 atomic ownership restore were built but not exercised.
- Top-level Settings search, regex section filtering, command-palette discovery, and the no-match state were exercised in the packaged runtime. The pre-correction artifact exposed a Funny-level routing mismatch; a fresh a1bb583 artifact verified that selecting Funny levels opens the matching filtered section. Valid regex matches, keyboard-only traversal, accessibility variants, and other universal evidence remain unverified.
- Personal-vocabulary file selection, strict validation failures, reload persistence, replacement, clear, command-palette routing, and five-string rendering coverage were built but not exercised in the packaged runtime.
- Desktop/site emoji-preference migration, global/project inheritance, Settings controls, snapshot schema 3, and aria-hidden notification/snackbar/status decoration were built but not exercised in the packaged runtime.
- Site personal-vocabulary selection, strict parsing, last-valid-cache preservation, reload persistence, five-string replacement, clear, and palette focus were built but not exercised in a browser runtime.
- Desktop/site changelog navigation, static published catalogue, text/regex/date filtering, no-match, clipboard copy, Markdown export, and commit links were built but not exercised in runtime artifacts.
- Site Global defaults, eight-field sparse project ownership, max-50 project creation, picker search/regex, active switching, inherited counts, reset, persistence migration, and vocabulary-cache exclusion were built but not exercised in a browser runtime.
- Site notifications now retain up to 100 schema-versioned browser-local records behind a visible unread-count control, with an independent anchored regex builder, accessible multi-select, page-scoped select-all, inverse selection, bulk dismissal, and filtered Markdown export. The source and site builds are the only verification in this lane; browser interaction and captures remain unverified.
- Site Settings now records up to 100 validated browser-local revisions containing only the eight effective presentation values and Global/project ownership. Its independent dialog provides plain/regex search, typed ISO date filters, derived action filtering, Markdown export, and confirmed restore recorded as a new event; personal vocabulary and private data are excluded. Runtime interaction remains unverified.
- The Pages command palette retains `Ctrl+Shift+F` and its current actions while adding palette-owned literal-first search plus a full adjacent regex builder with independent mode, flags, sample, matches, and error state. Invalid patterns produce zero results. Builds are recorded below; keyboard and browser interaction remain unverified.
- Pages Reset settings now routes both its Settings button and command-palette command through one blocking two-key/full-slider confirmation. It names removal of all local projects and restoration of the eight shipped defaults, preserves personal vocabulary plus histories, refuses duplicate completion, supports Escape/scrim/Emergency exit, and records the completed reset. Runtime confirmation interaction remains unverified.
- Pages App logo Settings now provides Forge, Tile, and Mono treatments of the existing local brand asset plus a 256 KiB byte-verified PNG/JPEG picker with bounded decoded dimensions, local persistence, live header/preview rendering, replace/reset states, and palette destinations. Stable product identity is unchanged; runtime file selection and visual output remain unverified.
- Pages tab docking now persists and renders left, right, top, or bottom placement, exposes all four localized choices plus a command-palette destination, applies matching ARIA/arrow-key direction and Home/End behavior, and collapses to a readable horizontal top strip at narrow widths. Runtime interaction and responsive visual output remain unverified.
- Pages Settings now has a 128-character top-level literal-first search across all 13 current Settings sections, including tab groups, with its own anchored full JavaScript regex builder, effective-value aliases, honest no-match state, and command-palette focus destination. Nested project/history/notification/changelog builders remain independent; runtime filtering and focus remain unverified.
- Pages tab navigation now measures the rendered strip at every dock edge and in the narrow horizontal fallback. When the ordinary destinations do not fit, a bounded local all-tabs surface provides plain-text-first discovery and an independent anchored JavaScript regex builder. Reordering and bounded groups are implemented in source; bulk close, remaining group/window searches, runtime interaction, and visual evidence remain outside this lane and unverified.
- Pages tab pinning now persists a validated list of the six shipped identifiers, exposes keyboard-reachable strip and all-tabs actions plus a current-tab palette command, and moves pins into a stable leading region with explicit future bulk-close protection. Reordering, groups, actual bulk close, runtime interaction, and visual evidence remain outside this lane and unverified.
- Pages tab reordering now persists a validated complete permutation of the six shipped identifiers, exposes axis-aware keyboard-reachable move controls without changing the active destination, keeps moves inside the pinned or ordinary region, and applies the current order to the strip, All-tabs results, and command-palette destinations. Groups, bulk close, runtime interaction, tests, audits, reviews, and visual evidence remain outside this lane and unverified.
- Pages tab groups now persist at most eight ordered, strictly validated local records with generated IDs, bounded names and hex colors, collapsed state, and unique membership across the six known tabs. Pinned tabs remain in their leading region; ordinary members render beneath localized group headers. Create, rename, remove-to-ungrouped, collapse/expand, and searchable Move… into group… paths are implemented in source. Per-group appearance editing, group bulk close, runtime interaction, tests, audits, reviews, and visual evidence remain explicitly incomplete or unverified.
- The follow-up tab-group repair adds fresh overflow measurement for every group mutation, a shared create/rename validator with visible invalid-rename recovery, eight-attempt collision-safe IDs, persisted and live pin/group coherence, exact rendered member counts, group-specific localized Settings relationships, explicit overflow-dialog wiring, localized picker RegexBuilder copy, 44-pixel group actions at normal/narrow widths, and localized disabled-create reasons. Per-group appearance editing, group bulk close, and remaining group/window discovery searches remain incomplete.
- The final tab-group repair hardens atomic group insertion and known-ID/color validation, traps focus in the move picker with Escape and opener restoration, keeps group controls reachable in narrow strips, names picker search and RegexBuilder relationships, bounds preference/notification/history storage, degrades safely when browser storage is unavailable, normalizes both tone values to 1–5, discards unknown preference-root fields, and reports leading/trailing whitespace in creation guidance. Runtime interaction, tests, audits, reviews, and visual evidence remain unverified; per-group appearance editing, group bulk close, and remaining group/window discovery searches remain incomplete.
- The follow-up tab-reordering repair discards unknown top-level stored Preferences fields, bases arrow navigation on the focused tab, adds equivalent overflow move controls with focus return, preserves localized names when compact labels are hidden, localizes navigation/tablist names and positional reorder announcements, and raises reorder targets to at least 44 by 44 pixels. Groups and bulk close remain incomplete; runtime interaction and visual evidence remain unverified.
- The next tab-group slice adds independent transient tab searches and anchored JavaScript regex builders inside every rendered group plus a separate Settings group-management search. Filtering does not alter stored membership or collapse state. Cross-window/master discovery, per-group appearance editing, and group bulk close remain incomplete; runtime interaction, tests, audits, reviews, and visual evidence remain unverified.
- The bulk-close slice adds All tabs actions for matching and inverse text predicates, a shared bounded regex builder, pinned inclusion opt-in, current-tab protection, named preview counts, and a two-acknowledgement/full-slider confirmation with Escape and Emergency exit. Cross-window bulk close, per-group appearance editing, and remaining discovery searches remain incomplete; runtime interaction, tests, audits, reviews, and visual evidence remain unverified.
- The group-order slice adds persisted up/down controls to both rendered group headers and Settings rows. Boundary controls disable at the first and last group, target sizes remain 44px, and moving a group preserves membership, collapse state, and active tab. Group appearance editing, cross-window discovery, and remaining bulk-close scopes remain incomplete; runtime interaction and visual evidence remain unverified.
- The manifest hydration repair passes the generated `pages/public/release-manifest.json` into the first site render and keeps the bounded fetch as refresh/fallback, preventing a published installer from flashing as unavailable before hydration. Static output and browser hydration remain unverified in this source-only lane.
- The bounded group-appearance slice adds schema-version 2 appearance migration, per-group icon/text/background controls, live rendering, strip and Settings entry points, and per-group reset. Full typography, infinite color translation, and per-state appearance editing remain incomplete; runtime interaction, tests, audits, reviews, and visual evidence remain unverified.
- Group appearance editors are now independently discoverable in the command palette and route to their exact Settings editor. Full typography, infinite color translation, and per-state appearance editing remain incomplete.
- The master-tab discovery slice adds a separate Settings search across every tab owned by this single site surface, with group/pinned context and focus routing. Cross-window ownership is explicitly bounded to one site instance; runtime interaction and visual evidence remain unverified.
## Local Ollama suite-manager lane — `codex/luna-ollama-suite`

- Added `pages/app/SiteShell.tsx` and `pages/app/globals.css` support for a local-only Ollama surface: bounded GETs to `127.0.0.1:11434/api/version` and `/api/tags`, a two-second timeout, 512 KiB response cap, up to 200 verified installed tags, and explicit healthy/stopped/offline/error states.
- Added plain installed-tag search plus an anchored JavaScript regex builder, with no cloud, payment, prompt-history, credential, telemetry, or arbitrary-shell path. Hardware and free-storage fit are explicitly not claimed by the browser surface.
- Added the matching checked-in design reference and `docs/site/ollama.md` / `docs/application/ollama.md` articles and index entries; updated the universal inventory row.
- Verification boundary: no tests, lint, reviews, screenshots, packaged runtime interaction, release, or publication were run in this requested lane.
## Toy locks and Support Tickets lane — `luna/toy-locks`

## Every-rendered-target toy-lock follow-up — `codex/luna-every-element-locks`

Implemented from `a55edf0d8c9d56280c6e3db71381d8b5b3029a21` in a fresh task-owned linked checkout. `pages/app/SiteShell.tsx` now assigns deterministic bounded `element-*` target IDs to rendered descendants, keeps `Lock this element…` and `Edit appearance…` together in an anchored context menu, opens the same local UX wizard from context menu, Enter, F2, locked activation, and command-palette entries, and stores each target's salted hash and duration independently. Locked targets remain visible and discoverable. `pages/app/globals.css` supplies the bounded M3 wizard/menu and locked-state treatment. The checked-in design reference, toy-lock docs, completeness inventory, changelog, and handoff state the same every-target contract and preserve Support Tickets/recovery.

The boundary is explicit: this is local UX-only, not security, encryption, authentication, network behavior, or deletion. Recovery remains browser-storage clearing or user-directed desktop application-data-folder deletion; Support Tickets never contact a service and never delete data.

Verification: `git diff --check` passed. Tests, lint, reviews, screenshots, built-artifact interaction, packaged desktop verification, release, and external issue/discussion updates were not run in this requested lane.

Implemented on branch `luna/toy-locks` from base `72644297a61e7ca5765497088cae47eec5e99987`.

Changed `pages/app/SiteShell.tsx`, `pages/app/globals.css`, `main-app-design/WinForge M3.dc.html`, the site/application toy-lock articles and indexes, the completeness inventory, `CHANGELOG.md`, and this handoff. The site persists only bounded salted hashes and local ticket metadata; it makes no network request and exposes self-service browser-storage or local application-data recovery without deleting anything.

Runtime interaction, tests, lint, reviews, screenshots, packaged desktop verification, release, and issue/discussion updates were not run in this bounded lane.
## Local Status Hub lane — `codex/luna-status-hub`

- Added the local Status Hub dashboard in `pages/app/SiteShell.tsx` and `pages/app/globals.css`. It reads only the existing release manifest, shows current commit/release/Hub availability cards, filters evidence lanes, expands evidence and next-check details, and displays a local-read heartbeat.
- Added the matching Status Hub reference treatment in `main-app-design/WinForge M3.dc.html`, `docs/site/status-hub.md`, `docs/application/status-hub.md`, both documentation indexes, and `docs/completeness/universal-feature-inventory.md`.
- The dashboard explicitly says authenticated Status Hub delivery is unavailable and offers a copy-for-chat fallback. It does not invent credentials, remote verdicts, or deployment state.
- Verification boundary: tests, lint, reviews, screenshots, packaged/runtime interaction, external Status Hub delivery, release, and publication were intentionally not run for this bounded lane.
## Local Ollama operations lane — `codex/luna-ollama-operations`

- Added bounded documented-loopback `POST /api/pull` and `POST /api/chat` flows in `pages/app/SiteShell.tsx`, with model-tag validation, installed-model selection, 30-second cancellation/timeout, 512 KiB response caps, and honest cancelled/error copy.
- Added explicit post-pull reconciliation guidance, local-only chat response handling, and a fixed allowlisted harness preview that never accepts arbitrary shell text or launches a process in the site surface.
- Updated `pages/app/globals.css`, the design reference, both Ollama articles and indexes, the universal inventory, and this changelog/handoff.
- Verification boundary: no tests, lint, runtime interaction, screenshots, release, or publication run for this lane; hardware/storage fit evidence remains intentionally unclaimed.
## Local file-converter depth lane — `codex/luna-converter-depth`

- Extended `pages/app/SiteShell.tsx` with a bounded 100-file queue, two-worker JSON↔CSV processing, pause/resume/cancel, per-file outcomes, browser-download destination disclosure, and adapter-catalog plain search plus anchored regex-builder state.
- Updated `pages/app/globals.css`, `main-app-design/WinForge M3.dc.html`, both converter articles and indexes, the universal inventory, and the changelog. Only the real offline JSON↔CSV adapter remains enabled; no PATH, network, PDF, image, audio, video, archive, or binary converter was added.
- Evidence boundary: source/diff only. No tests, lint, runtime interaction, accessibility review, screenshots, release, publication, or issue scan was run in this no-verification lane.
## Local file-converter completeness lane — `codex/luna-converter-completeness`

- Extended `pages/app/SiteShell.tsx` with byte detection for JSONL and TSV, bundled offline JSON ↔ JSONL and JSON ↔ TSV adapters alongside JSON ↔ CSV, output validation before browser download, and explicit JSONL/TSV conversion boundaries.
- Updated the checked-in design/runtime reference, both converter articles, the universal feature inventory, and changelog. PDF, image, audio, video, archive, and binary categories remain visibly unavailable; no PATH tool, network converter, source persistence, or queue/history boundary changed.
- Tests, lint, runtime interaction, screenshots, reviews, release, and publication were not run in this task lane by request.
## Appearance-editor depth lane — `codex/luna-appearance-depth`

- Extended `pages/app/SiteShell.tsx` and `pages/app/globals.css` with bounded local controls for weight, style, underline/strikethrough, letter/word spacing, line height, direction, alignment, continuous color fields, HEX translation, alpha, contrast ratio, local presets, reset disclosure, and explicit unsupported-property behavior.
- Extended `main-app-design/WinForge M3.dc.html` with the matching deterministic local reference preview and v2 local appearance record.
- Updated the site/application articles and indexes, universal inventory row, and Unreleased changelog.
- No network, credential, remote-font, or source-file path is used. Tests, lint, reviews, runtime interaction, accessibility review, captures, release, and publication remain unrun/unverified for this lane.
- External-editor lane: the desktop Settings surface now discovers only fixed Visual Studio Code and Notepad++ candidates, persists the selected editor in private application data, validates absolute project/file targets, and opens them through a no-shell bounded IPC bridge. VS Code is the preferred export handoff; missing editors, unsupported bridge/platform, invalid targets, persistence failures, and launch failures remain truthful non-blocking states. The Pages site remains a landing/documentation surface and does not claim operating-system access.
- Changed `main-app-design/electron/main.js`, `main-app-design/electron/preload.js`, `main-app-design/WinForge M3.dc.html`, `docs/application/external-editor.md`, `docs/application/README.md`, `docs/completeness/universal-feature-inventory.md`, `CHANGELOG.md`, and this handoff. Ran vocabulary/publication/diff preflights; tests, lint, packaged interaction, editor launch, accessibility review, captures, release, and publication remain unrun for this lane.
