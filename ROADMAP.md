# Roadmap

The roadmap distinguishes source capability from proof. A checked item means the repository contains the stated implementation; it does not imply packaged runtime verification unless explicitly named.

## Initial bootstrap

- [x] Establish the WinForge · Material 3 Preview identity and preview-only disclosure.
- [x] Add a one-route vinext landing and documentation site.
- [x] Add local language, tone, theme, density, accent, and tab-position preferences.
- [x] Add command-palette navigation and search with an anchored regex builder.
- [x] Add a release-manifest-aware installer control.
- [x] Add deterministic social-image generation from the existing brand source.
- [x] Add public-safe project documentation and wiki source.

## Release wiring

- [x] Publish `v1.0.20` as a unique, non-draft GitHub release carrying the complete unsigned Squirrel.Windows asset set for commit `3e765b4ca49e7d255a67ee370b10ed7d64b1d9cc`.
- [x] Generate the published release manifest with the exact version, tag, commit, asset URL, SHA-256, size, and publication time from the release record.
- [x] Deploy the static GitHub Pages output at the canonical project URL and verify the served Open Graph metadata and image URL.
- [ ] Deploy the same source as a private Sites mirror after an exact Sites project identifier is returned.
- [ ] Upload the root `social-preview.png` through GitHub repository settings and confirm the repository card.

## Evidence and product completion

- [ ] Complete every row in the [universal feature completeness inventory](docs/completeness/universal-feature-inventory.md), including negative-regression evidence.
- [ ] Ship the design-reference evidence app and complete the [design-parity inventory](docs/completeness/design-parity-inventory.md).
- [ ] Launch and interact with the packaged desktop artifact through the approved headless route.
- [ ] Capture every real application and site surface at a known commit, including narrow and both-theme states.
- [ ] Verify the unsigned installer and update artifacts on a clean Windows environment.
- [ ] Add focused accessibility, localization, persistence, search, regex, and release-manifest evidence.
- [ ] Replace preview-only controls with real operating-system integrations only when each integration has explicit security boundaries, recovery behavior, and independent verification.
- [ ] Implement remaining universal product contracts only through separately scoped, documented work rather than implying they exist in this preview.

## Repository maintenance, 2026-09-18

- [x] Inventory the primary checkout, all linked worktrees, local and remote branches, stashes, reflogs, unresolved index entries, and conflict markers.
- [x] Fetch `origin` and fast-forward `main` to `68f34e9e97a240360b841295bdb8c825c88e19fb`; verify the remote ref with `git ls-remote`.
- [x] Confirm there were no recoverable uncommitted files, half-finished changes, stashes, linked worktrees, or redundant branches to preserve or remove.
- [x] Record the maintenance evidence and retention decisions in `HANDOFF.md`.
- [x] Confirm that no removal was required because no safe redundant linked checkout, branch, or stash existed; create and verify the OneDrive archive before making that decision.
