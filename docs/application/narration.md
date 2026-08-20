# Desktop narrator

The desktop Settings surface provides an opt-in narrator for app notifications. It uses the platform `speechSynthesis` API locally; it does not call a network service, read credentials, or send notification text away from the app.

## Behavior

- Narrated language is English, Cantonese, or bilingual. Bilingual speech is serialized English then Cantonese, never overlapping.
- Voices are enumerated at runtime from the platform. The persisted selection is the stable `voiceURI`, not a display name. **Choose automatically** is the default.
- If a selected voice is no longer installed, the utterance falls back to the platform's automatic voice selection while retaining the saved stable ID and showing a factual status.
- Rate and pitch are bounded from `0.5` through `2.0`, in `0.1` steps, and persist locally.
- Speech is off by default. Notification speech is debounced by category; errors are still announced. A queued line replaces an older queued line, and the active utterance finishes before the next language or notification part starts.
- The Settings search indexes the narrator card and its current values. The `Ctrl+Shift+F` command palette includes a **Narrator and voice pickers** destination that focuses this card.

## Privacy and failure modes

Only the validated narrator preferences and stable voice IDs are stored in local browser storage. Voice names are runtime facts and are not treated as identity. When speech synthesis is unavailable or has not populated its voice list yet, the Settings card reports that state and the rest of the app remains usable. A network-backed platform voice is labelled as such; the app does not initiate a network request or claim that it is available offline.

## Verification boundary

This slice has source and documentation evidence only. Tests, lint, packaged runtime interaction, real voice enumeration, missing-voice fallback, keyboard-only narration settings, accessibility review, and captures were intentionally not run.

Suggested reading: [Scheduled settings](scheduled-settings.md), [Message emoji preference](message-emoji-preference.md), and [School mode](school-mode.md).
