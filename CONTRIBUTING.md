# Contributing

## Before changing code

1. Read [AGENTS.md](AGENTS.md), the relevant [feature documentation](docs/README.md), and the current [handoff](HANDOFF.md).
2. Inspect the working tree and preserve unrelated changes.
3. Use a focused branch or linked worktree when parallel ownership or collision risk requires isolation.
4. Keep the product identity and preview boundary truthful.

## Site development

```powershell
npm --prefix pages install
npm --prefix pages run dev
```

Use `npm --prefix pages run build:sites` for the Worker target and `npm --prefix pages run build:pages` for the static GitHub Pages target. Do not add remote fonts, CDNs, analytics, or guessed release URLs.

Any new search field must keep plain text as its default and add its own adjacent, anchored full regex builder. Any new visible behavior must be documented in the same change.

## Public records

- Use ordinary professional language in source comments, commits, issues, discussions, release notes, and documentation.
- Never include credentials, private machine details, internal network details, or unverified claims.
- Do not say a build was tested, launched, installed, visually reviewed, or captured unless exact evidence exists.
- Code signing is intentionally prohibited; never add signing inputs or signing workflows.

## Commit expectations

Keep commits focused and descriptive. Follow the repository-configured author identity and bilingual commit-message format. Update the changelog, documentation, roadmap, handoff, and wiki source when behavior changes.
