# Changelog

## Unreleased

### Fixed

- Restrict the release workflow's push trigger to `main`, preventing each generated release tag from recursively starting another release.

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

### Verification boundary

- `npm --prefix pages run build:sites` completed under Node 22.23.2 after the exact Sites project record was configured.
- `npm --prefix pages run build:pages` completed under Node 22.23.2, statically prerendering `/` into `pages/dist/client` with zero skipped routes.
- Tests, lint, runtime interaction, installer execution, visual review, and screenshots were not part of the initial ultra-speed bootstrap.
