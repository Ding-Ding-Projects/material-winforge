# Global defaults and project overrides

## Behavior

Settings stores global defaults for theme, language, English tone, and Cantonese tone. A user may create up to 50 local project records with names from 1 to 64 characters. No sample project is seeded. The active-project picker always includes **Global defaults** and lists only projects the user created.

Each project stores sparse overrides. A value equal to its global default is removed from the project record and inherited instead. The active-project picker has its own bounded plain-text search and adjacent anchored regex builder; filtering matches the Global defaults choice plus user-created names and generated IDs without changing the current selection. A no-match result is distinct from the no-project state. The surface reports the exact override and inherited counts, applies the effective values immediately, and offers **Reset project to global** to remove all four overrides. Switching back to global defaults edits the values inherited by every project that has no corresponding override.

The Settings surface also has a top-level bounded plain-text search with its own adjacent anchored regex builder. It filters whole sections—Global/project scopes, Appearance, Funny levels, and Local state—against labels, descriptions, and current values. Filtering never changes a setting or active project. A no-match message states that persisted values remain untouched. The command palette registers the search field and each section and opens Settings with the corresponding filter.

## Storage and validation

State remains in the existing local browser store. Project identifiers are generated locally and validated against a bounded lowercase identifier pattern. Names, IDs, project count, override keys, and every value are validated on load. Unknown keys, invalid values, duplicate IDs, and records past the 50-project limit are rejected. Records contain no path, credential, account, host detail, or network configuration, and no network request is made.

## Snapshot ownership

New schema-version 2 local snapshots capture the four effective presentation values plus a versioned ownership block containing the validated global defaults, up to 50 project records, sparse override maps, and active-project identifier. Restore validates that the ownership block resolves to the same effective values recorded by the snapshot, then applies presentation and ownership together after the current-state safety snapshot succeeds.

Legacy schema-version 1 snapshots remain readable. They restore only effective presentation values and deliberately preserve the current global defaults, projects, overrides, and active-project selection.

## Failure modes

- An empty or oversized name is rejected without creating a project.
- Project creation stops at 50 records.
- Invalid persisted records are omitted during bounded load validation.
- Reset removes only the active project's overrides and preserves global defaults and other projects.
- No active project means changes edit global defaults.

## Verification boundary

The c144163 packaged artifact was driven through the approved hidden desktop route. Project creation, Light override, Global defaults, reset-to-global, same-profile persistence, and schema-version 2 ownership restore were verified at 1480×940 across fresh process/desktop lifecycles. The later top-level Settings search, regex filtering, command-palette routing, no-match behavior, invalid-record omission, schema-version 1 compatibility, timeout paths, accessibility variants, tests, lint, type checking, installer execution, and screenshots remain unverified.
