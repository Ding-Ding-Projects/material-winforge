# Site narrator

## Behavior

The site includes an opt-in narrator for local notification text. Narration is off by default and can be enabled from **Settings → Narrator**. The site supports English, Cantonese, or serialized bilingual speech. Bilingual messages are spoken as English followed by Cantonese, never concurrently. A bounded pending queue replaces stale pending messages while the active utterance finishes, so a burst of notifications cannot make speech trail behind the visible site. **Speak a local preview** exercises the same selected language and voice route without making a network request.

Voice choices come from the browser's runtime `speechSynthesis` inventory. The site stores each selected voice's stable `voiceURI`, not its display name. Runtime options identify the reported language and whether the platform marks the voice as local or network-backed; the site never downloads a voice. **Choose automatically** is the default and lets the browser select the best installed voice. Rate and pitch are adjustable from 0.5× to 2×.

## Configuration and persistence

Narrator settings use a versioned, bounded local-storage record (`schemaVersion: 1`) with enabled state, language, English and Cantonese voice IDs, rate, and pitch. The record is capped at 16 KiB, validated before use, and discarded if malformed, oversized, or outside the declared bounds. The setting is independent from Global/project presentation overrides because speech synthesis is a browser-local capability.

The Settings search and command palette both expose the Narrator destination. The controls are keyboard reachable, preserve visible focus, use 44-pixel targets, and stack at narrow widths.

## Failure modes

If speech synthesis is unavailable, the narrator control remains visible but disabled and reports that limitation. Browsers can enumerate voices asynchronously; the surface reports that it is waiting and refreshes when `voiceschanged` fires. If a saved voice is no longer installed, the saved ID remains intact, remains visible as an unavailable selection, and speech falls back automatically rather than silently rewriting the choice. A network-backed platform voice may be silent offline; that is reported as a platform fact, not treated as a site download failure.

## Security and privacy

Narration is local-only. No voice list, notification text, voice ID, or setting is sent over the network. The site does not download voices, persist source paths, or expose speech data in exports, history, telemetry, or public records. Speech cancellation runs on teardown so an unmounted surface cannot keep speaking.

## Verification

The bounded Sites and Pages builds are the current source/build evidence for this slice. Browser speech interaction, voice enumeration, unavailable-browser behavior, fallback, keyboard use, and visual captures remain unverified in this ultra-speed pass; no tests, lint, reviews, audits, or screenshots were run.

## Suggested articles

- [Local preferences](preferences.md)
- [Top-level Settings search](settings-search.md)
- [Rich command palette](command-palette.md)
- [Notification history](notifications.md)
