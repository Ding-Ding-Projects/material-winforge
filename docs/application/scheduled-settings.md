# Scheduled settings

The desktop Settings surface includes a bounded local scheduler for temporary presentation overrides. A rule may set any of the five existing app-wide settings: theme, language, English tone, Cantonese tone, and message-box emoji decoration. It resolves after the current Global defaults and active project's sparse overrides; base values return automatically when the matching window ends.

## Rule shape and local semantics

Rules use schema version `1`, a stable identifier and label, enabled state, optional start/end dates, start/end times, one or more weekdays, priority `0–100`, a source, and sparse values. Native date/time controls use the operating system's local timezone, which the UI names. Cross-midnight windows are supported; reversed date ranges are rejected. “Every day” is seven weekday values rather than duplicated rules. Higher priority wins, then stable update timestamp and identifier provide deterministic tie-breakers. Matching is recalculated at startup and on a bounded timer. Effective values are temporary and never written back into Global defaults or project overrides.

## Sources and safety boundary

`local` is the only active source in this desktop preview. `https-api` and `home-assistant` remain visible so the contract boundary is explicit, but they are labelled unconfigured and do not make a network request, accept a URL, or store a credential. A future external implementation must validate a bounded versioned response in the privileged boundary, keep tokens in the operating-system credential vault, reject redirects and embedded credentials, and fail safe to the last valid local/base values. No schedule record contains a token, host, account, path, or response body.

## Persistence and failure modes

At most 50 validated rules are stored in the existing local browser store under `schedules`; malformed, duplicate, unknown-key, out-of-range, or unsupported-source records are rejected on load. Schedule records are intentionally excluded from the existing snapshot payload so restoring a presentation snapshot cannot silently create or remove a scheduled override. Clearing local state removes rules with the other local preferences. A no-match search is distinct from an empty schedule, and a disabled rule remains listed with its exact state.

## Verification

The source model, editor wiring, bounded validation, local-time matching, deterministic precedence, temporary restoration, and external-source disclosure are present in [`main-app-design/WinForge M3.dc.html`](../../main-app-design/WinForge%20M3.dc.html). Tests, lint, packaged interaction, accessibility review, and real captures were not run in this scoped pass; those are evidence gaps rather than claims of completion.

Suggested articles: [Global defaults and project overrides](project-settings-overrides.md), [Local snapshot](local-snapshot.md), and [Preview boundary](preview-boundary.md).
