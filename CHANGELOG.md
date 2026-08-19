# Changelog

## Unreleased

### Fixed

- Restrict the release workflow's push trigger to `main`, preventing each generated release tag from recursively starting another release.
- Replaced the stale all-sample top banner with exact bounded-live, remaining-preview, and runtime-unverified disclosures.

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

### Verification boundary

- `npm --prefix pages run build:sites` completed under Node 22.23.2 after the exact Sites project record was configured.
- `npm --prefix pages run build:pages` completed under Node 22.23.2, statically prerendering `/` into `pages/dist/client` with zero skipped routes.
- Tests, lint, runtime interaction, installer execution, visual review, and screenshots were not part of the initial ultra-speed bootstrap.
