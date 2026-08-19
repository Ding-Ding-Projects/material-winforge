# Local site preferences

## Behavior

The Settings tab changes the site immediately and stores the selected presentation on the current device. It exposes:

- English, playful Hong Kong-style Cantonese, and bilingual language modes
- Separate five-level English and Cantonese tone sliders
- System, light, and dark themes
- Comfortable and compact density
- Left or top tab docking
- Local accent color
- Show emojis in dialogs and message boxes, applied only as aria-hidden decoration in site notifications and status cards
- One-action reset to shipped defaults

Tone controls style voice, not facts. Preview boundaries, release state, version data, platform names, checksums, and warning facts remain exact.

## Configuration

Preferences use the versioned browser-storage key `winforge-material-preview-preferences-v1` and an internal `schemaVersion: 1` record. The shipped defaults are English, English tone 2, Cantonese tone 3, system theme, comfortable density, left tabs, accent `#2f7d45`, and decorative message emoji enabled. Legacy records without the boolean migrate to enabled.

Emoji decoration never changes notification/status text, controls, accessible names, release facts, checksums, platform names, or warnings. English, Cantonese, and bilingual Settings copy names the same preference.

## Failure modes

Missing or corrupt stored JSON is discarded and the site returns to shipped defaults. Storage failure must not block page rendering. Reset changes site preferences only and never alters the desktop application.

## Security and privacy

Stored data contains presentation choices only. It contains no credential, system setting, private path, analytics identifier, or synchronized account value.

## Verification

The initial source implements loading, persistence, live application, and reset paths. The ultra-speed bootstrap does not claim browser interaction testing or cross-browser persistence proof.

## Suggested articles

- [Landing page](landing-page.md)
- [Search and regex builder](search-and-regex.md)
