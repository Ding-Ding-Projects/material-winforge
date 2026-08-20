# Desktop notification center

The desktop preview keeps the existing corner snackbar non-blocking and adds a reviewable **Notifications** center. Each event is a bounded local record with a stable ID, severity, title, body, ISO timestamp, and read state. Information and success snackbars auto-dismiss; warnings and errors remain in history until the user dismisses them. Opening the center no longer silently marks records read: unread state is explicit and can be changed with **Read**, **Mark read**, or by activating an individual row.

## Search and bulk actions

The center owns its own bounded search field. Plain text, case-insensitive matching is the default. The adjacent anchored regex-builder command is an explicit opt-in to the JavaScript regular-expression dialect; invalid expressions produce an honest no-match state instead of silently falling back to another mode. Search state stays local to the center.

The visible page supports **Select page**, **Invert**, **Mark read**, **Dismiss selected**, and **Export**. Selection is separate from read state, remains keyboard reachable through the row checkbox, and the footer reports the selected and retained counts. Export writes a local JSON file containing only the selected visible records (or the visible page when none are selected). No upload, network request, credential, private vocabulary, source path, or secret is included.

## Bounds, privacy, and failure behavior

At most 200 records are retained. On load, malformed records, unsupported severity, duplicate or unsafe IDs, control characters, oversized text, and invalid timestamps are rejected rather than partially applied. Older records without IDs are migrated to local IDs. The renderer uses the same local storage record as the preview and does not call a remote notification service. If browser storage is unavailable, the current in-memory center remains usable but persistence cannot be promised.

Unread rows expose a non-colour indicator and an accessible state, while the optional message-emoji preference adds only `aria-hidden` decoration. Emoji never replaces the title, body, severity, accessible name, or action label. The center is a non-modal, labelled dialog with bounded scrolling, visible focus, keyboard activation, and a truthful empty/no-match state. It does not claim to control operating-system notifications.

Verification for this implementation slice is source/build preflight only. Desktop runtime interaction, accessibility tooling, tests, lint, installer execution, and screenshots remain unrun in the ultra-fast lane.

Suggested articles: [Message emoji preference](message-emoji-preference.md), [Narration](narration.md), [Export center](export-center.md), and [Search and regex builder](../site/search-and-regex.md).
