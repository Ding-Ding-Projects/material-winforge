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

## Verification state

- Tests: not run in the initial ultra-speed pass.
- Lint and static analysis: not run.
- Desktop runtime interaction: not run.
- Installer execution: not run.
- Screenshots or visual review: not run.
- Worker-target site build: final `npm --prefix pages run build:sites` exited 0 under verified official Node 22.23.2 after the exact returned Sites project identifier was recorded.
- Static GitHub Pages build: final `npm --prefix pages run build:pages` exited 0 under the same runtime, classified `/` as static, prerendered it with zero skipped routes, and wrote `pages/dist/client/index.html` plus `.nojekyll` and local public assets.
- Social assets: `pages/public/og.png` and root `social-preview.png` are byte-identical 1200×630 PNG files with SHA-256 `6720a5713878e429a42a7c02f75aa3c2d0aa7fae053ce634f1e03a122536ea8d`.
- Deployment and release: not yet claimed by this handoff.

## Next owner actions

1. Record the exact candidate commit used by each build.
2. Package or deploy only from a pinned candidate commit; rerun both site builds if the candidate changes.
3. Publish and independently verify the expected unsigned release assets.
4. Generate the published release manifest from the exact release record and rebuild both site targets.
5. Deploy the canonical GitHub Pages site and private Sites mirror, then fetch the served Open Graph tags and image anonymously.
6. Upload `social-preview.png` through **Settings → General → Social preview → Upload an image** and keep this step open until a person confirms it.
7. Schedule separate runtime and capture work; do not reinterpret source builds as installation or visual proof.

## Known limitations

- Desktop controls are preview interactions until their real operating-system integrations are implemented and verified.
- The default manifest is intentionally unavailable, so the installer button is disabled.
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
