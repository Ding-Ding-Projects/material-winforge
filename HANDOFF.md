# Handoff

## Release-trigger repair

The release workflow now responds to pushes on `main` and manual dispatch only. The prior bare `push` trigger also matched generated tags, causing releases v1.0.2 through v1.0.4 to start subsequent workflow runs. Run `32213126094` was cancelled while active. The already published releases and tags were preserved because deleting release history was not authorized.

## Current scope

This repository bootstraps **WinForge · Material 3 Preview**: an Electron desktop design preview plus a one-route vinext landing and documentation site. The site is deliberately honest that it is not the installed application and does not change Windows settings.

## Implemented source

- Material Design 3 site shell with dockable tabs for Home, Feature map, Documentation, Settings, and Status.
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
- Settings now supports validated local global defaults plus up to 50 user-created, path-free project records with sparse theme, language, and tone overrides, live effective values, inheritance counts, and reset-to-global.
- The active-project picker has its own bounded plain-text search and anchored regex builder; filtering Global defaults and local projects never changes the active selection, and no-match copy stays distinct from the empty-project state.

## Verification state

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

## Next owner actions

1. Keep future builds pinned to their exact candidate commit and record the resulting release evidence.
2. The private Sites mirror still needs an independently verified deployment; do not infer it from the successful Pages run.
3. Upload `social-preview.png` through **Settings → General → Social preview → Upload an image** and keep this step open until a person confirms it.
4. Schedule separate runtime and capture work; do not reinterpret source builds as installation or visual proof.

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
- Global-default editing, project creation and switching, sparse inheritance, live effective values, reset, reload persistence, and invalid-record omission were built but not exercised. Snapshots capture effective presentation values only and do not restore the project/default ownership records.
