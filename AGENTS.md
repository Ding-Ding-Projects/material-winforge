# Repository agent instructions

This file is a sanitized repository mirror of the shared working agreement. Update the canonical shared instructions first when changing global behavior, then refresh this mirror without adding private machine, account, network, or credential details.

## Scope and truthfulness

- Treat the product as **WinForge · Material 3 Preview** until real runtime behavior is independently proven.
- The website is a landing, documentation, download, status, settings, and link surface. It is not the desktop runtime and must never claim to perform operating-system actions.
- Keep public copy free of private vocabulary, hostnames, usernames, absolute external paths, LAN information, credentials, or internal status language.
- Do not invent releases, tests, screenshots, runtime behavior, download URLs, checksums, issue state, or deployment results.

## Working safely

- Inspect repository status before editing and preserve unrelated work.
- Use the Git CLI for local repository operations and the GitHub CLI for GitHub operations.
- Never force-push, rewrite tags, discard unrelated commits, commit secrets, or perform code signing.
- Keep code-signing inputs disabled. Windows installers are intentionally unsigned and must say so.
- Use repository-owned branches and linked worktrees for parallel writable lanes. Keep ownership paths non-overlapping.
- Commit generated lockfiles and intentional generated brand assets, but never dependency directories or build output.

## Site contract

- Keep `.openai/hosting.json` with `d1` and `r2` set to `null`; do not invent a Sites project identifier.
- Use vinext and `@openai/sites-vite-plugin`. `npm --prefix pages run build:sites` builds the Worker bundle.
- `npm --prefix pages run build:pages` must statically export to `pages/dist/client` under `/material-winforge`.
- Keep the canonical URL `https://ding-ding-projects.github.io/material-winforge/` in Open Graph metadata. The image URL must be absolute HTTPS.
- Bundle assets locally. Do not add CDNs, analytics, remote fonts, or runtime image downloads.
- Preserve the visible preview-only disclosure and the release-manifest-aware download control.
- Plain text remains the default search mode. Every site search change must preserve the adjacent, anchored full regex builder and its JavaScript dialect disclosure.
- Preserve keyboard focus, adequate touch targets, reduced-motion handling, screen-reader names, responsive behavior from 320 px, and no sideways body scrolling.

## Documentation and release records

- Update README, affected categorized feature articles, changelog, roadmap, handoff, and wiki source with behavior changes.
- Each feature article covers behavior, configuration, failure modes, security/privacy, verification, and suggested related reading.
- Published release claims require an immutable tag and release, a non-draft record, expected non-empty downloadable assets, and the manifest fields documented in `docs/release/release-downloads.md`.
- GitHub Actions may build, package, publish, and attach evidence, but must not run tests or lint as release gates.
- Tests, lint, runtime interaction, screenshots, and accessibility review remain local evidence activities only when the active task requests them.

## Public writing

- Use ordinary professional terminology in commits, issues, discussions, release notes, documentation, and site copy.
- Commit messages must clearly describe behavior and use the repository’s configured authorship and required bilingual format.
- Never publish credentials, private vocabulary, machine-specific routes, or claims not supported by exact evidence.
