# Changelog

## Unreleased

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

### Verification boundary

- `npm --prefix pages run build:sites` completed under Node 22.23.2 after the exact Sites project record was configured.
- `npm --prefix pages run build:pages` completed under Node 22.23.2, statically prerendering `/` into `pages/dist/client` with zero skipped routes.
- A fresh cheap headless session launched the packaged `b52cf34` artifact, resolved one `Chrome_WidgetWin_1` product window, visually confirmed the repaired bounded-live banner, rendered real CPU, memory, app-data-disk, and network values, clicked the read-only metrics summary, and closed the owned process tree and hidden desktop. The first `c0a5d72` runtime capture had exposed the stale banner that `b52cf34` repaired.
- Tests, lint, runtime interaction, installer execution, visual review, and screenshots were not part of the initial ultra-speed bootstrap.
