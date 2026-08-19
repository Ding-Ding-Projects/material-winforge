# Site notification history

## Behavior

The Pages site keeps its existing non-blocking snackbar and records each announced site event in a separate notification center. The center shows an unread count, up to 100 newest records, honest empty and no-match states, and per-record kind, title, body, and ISO timestamp.

The list supports keyboard-accessible checkbox selection, **Select all this page**, inverse selection, bulk dismissal, and Markdown export of the currently filtered view. Dismissal removes only the selected local records. Export does not include browser paths, credentials, private vocabulary mappings, or other visitor data.

## Search and regex

Notification search is literal, case-insensitive plain text by default. Its adjacent anchored regex builder is an explicit opt-in and owns its own query, mode, flags, sample, syntax feedback, and live-match display. Invalid expressions produce an empty result rather than falling back to a different interpretation.

## Persistence and limits

History uses the browser-local key `winforge-material-preview-notifications-v1` with schema version 1. The complete record is validated when loaded. Unknown fields, unsupported versions, duplicate or malformed identifiers, invalid timestamps, control characters, oversized titles or bodies, and more than 100 records cause the stored history to be rejected. No notification history leaves the browser.

## Language, emoji, and accessibility

The center's controls and states use the site's English, Cantonese, or bilingual mode. When **Show emojis in dialogs and message boxes** is on, each history row receives an `aria-hidden` kind decoration; control labels and factual text stay unchanged. The center is a labelled dialog, supports Escape dismissal, has visible focusable controls, and keeps list scrolling inside its bounded surface.

## Failure modes and verification

If browser storage is unavailable, the live in-memory history remains usable for the current visit but cannot be promised across reloads. Invalid stored data is discarded rather than partially applied. Source and build verification cover the implementation boundary; browser-runtime interaction, accessibility tooling, and visual capture remain unverified in this ultra-fast implementation pass.
