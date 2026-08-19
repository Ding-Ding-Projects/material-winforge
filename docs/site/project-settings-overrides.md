# Global defaults and project overrides

## Behavior

The site Settings grid includes **Global defaults** and up to 50 user-created local project records. No sample project is seeded. Effective values resolve from the global record plus sparse overrides for the active project and apply immediately.

The explicit site allowlist contains every existing persisted presentation preference: `language`, `funnyEnglish`, `funnyCantonese`, `theme`, `dock`, `density`, `accent`, and `showEmojis`. A project value equal to its global default is removed from the sparse override. The surface reports exact override and inherited counts, switches active projects, creates bounded projects, and resets the active project to Global defaults.

## Project picker

The picker has its own bounded 128-character plain-text search and adjacent JavaScript regex builder. Plain text is the default. Filtering covers visible names and strict generated IDs without changing the active selection. Empty-project and no-match states remain distinct.

Project names are trimmed, nonempty, free of control characters, and at most 64 characters. IDs match the local generated `project-[a-z0-9-]{6,48}` boundary and remain unique. Invalid persisted records are omitted; the count is capped at 50.

## Privacy boundary

Ownership stays in the versioned browser-local Preferences record. It contains presentation choices only—no paths, credentials, accounts, host facts, or network configuration. The validated personal-vocabulary cache is intentionally excluded: it is private visitor data and is never copied into a project override, project reset, or project switch.

## Verification boundary

Source and both site builds may be exercised for this slice. Migration, create, search/regex, switch, sparse inheritance, reset, counts, reload persistence, invalid-record omission, and vocabulary exclusion remain runtime-unverified. Tests, lint, reviews, audits, and screenshots were not part of this ultra-speed lane.
