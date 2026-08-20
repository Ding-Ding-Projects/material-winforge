# Scheduled settings

The desktop Settings surface includes a bounded local scheduler for temporary presentation overrides. A rule may set any of the five existing app-wide settings: theme, language, English tone, Cantonese tone, and message-box emoji decoration. It resolves after the current Global defaults and active project's sparse overrides; base values return automatically when the matching window ends.

## Rule shape and local semantics

Rules use schema version `1`, a stable identifier and label, enabled state, optional start/end dates, start/end times, one or more weekdays, priority `0–100`, a source, and sparse values. Native date/time controls use the operating system's local timezone, which the UI names. Cross-midnight windows are supported; reversed date ranges are rejected. “Every day” is seven weekday values rather than duplicated rules. Higher priority wins, then stable update timestamp and identifier provide deterministic tie-breakers. Matching is recalculated at startup and on a bounded timer. Effective values are temporary and never written back into Global defaults or project overrides.

## Sources and safety boundary

The desktop now supports three bounded source modes. `local` applies its allowlisted values directly. `https-api` reads a version-1 JSON response through the privileged bridge, accepting only HTTPS or loopback HTTP, refusing redirects, embedded credentials, oversized/malformed responses, and non-2xx/auth failures. `home-assistant` reads a boolean entity at `/api/states/<entity>` and applies `attributes.settings` only while its state is `on`; an `off` state leaves the base values active. Each external rule has a 30–86,400 second refresh interval and a stable generation so a late response cannot overwrite a newer one. Offline, timeout, malformed, auth, unavailable, and `off` states retain the last valid external values (when present) or the current global/project base values.

External configuration is bounded and non-secret: URL, entity identifier, refresh interval, and a stable `credentialRef` may be stored, but never an access token, response body, account, or source path. Home Assistant requires a credential-vault reference and refuses to accept a token from renderer state; the current preview reports `auth-required` until a host credential-vault adapter supplies the reference. The bridge does not return credentials. This is a source-level boundary; packaged runtime interaction, tests, lint, accessibility review, and captures remain unrun in the accelerated lane.

## Persistence and failure modes

At most 50 validated rules are stored in the existing local browser store under `schedules`; schema version 2 adds only bounded source metadata. Malformed, duplicate, unknown-key, out-of-range, or unsupported-source records are rejected on load. Schedule records are intentionally excluded from the existing snapshot payload so restoring a presentation snapshot cannot silently create or remove a scheduled override. Clearing local state removes rules with the other local preferences. A no-match search is distinct from an empty schedule, and a disabled rule remains listed with its exact state.

## Verification

The source model, editor wiring, bounded validation, local-time matching, deterministic precedence, temporary restoration, and external-source disclosure are present in [`main-app-design/WinForge M3.dc.html`](../../main-app-design/WinForge%20M3.dc.html). Tests, lint, packaged interaction, accessibility review, and real captures were not run in this scoped pass; those are evidence gaps rather than claims of completion.

Suggested articles: [Global defaults and project overrides](project-settings-overrides.md), [Local snapshot](local-snapshot.md), and [Preview boundary](preview-boundary.md).
