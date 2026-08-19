# Local site preferences

## Behavior

The Settings tab changes the site immediately and stores the selected presentation on the current device. It exposes:

- English, playful Hong Kong-style Cantonese, and bilingual language modes
- Separate five-level English and Cantonese tone sliders
- System, light, and dark themes
- Comfortable and compact density
- Left, right, top, or bottom tab docking
- Local accent color
- Show emojis in dialogs and message boxes, applied only as aria-hidden decoration in site notifications and status cards
- A strict local personal-vocabulary JSON cache with semantic load/replace/clear controls
- One-action reset to shipped defaults

The chosen edge persists in the versioned browser-local Preferences record and applies immediately. Left and right use a vertical tablist with <kbd>ArrowUp</kbd>/<kbd>ArrowDown</kbd>; top and bottom use a horizontal tablist with <kbd>ArrowLeft</kbd>/<kbd>ArrowRight</kbd>. <kbd>Home</kbd> and <kbd>End</kbd> select the first and last tab at every edge. Focus follows selection. Reordering uses separate labelled move controls and does not replace these navigation keys.

At widths of 760 pixels or less, every dock choice renders as a compact horizontal strip at the top so the content keeps the full available width. The accessibility orientation changes to horizontal with the rendered layout, so the matching left/right keys apply. The persisted desktop-width edge remains unchanged and returns when the viewport widens.

When the rendered strip cannot fit all six destinations, an **All tabs** affordance opens a bounded local discovery surface. Its search starts in plain-text mode and has its own adjacent anchored JavaScript regular-expression builder, flags, sample text, match count, invalid-pattern feedback, and honest no-match state. Choosing a result activates the same existing tab; it does not duplicate navigation state. The surface makes no network request and stores no search input.

Each tab has a keyboard-reachable pin toggle, and the command palette can pin or unpin the current tab. Pin choices are validated against the six shipped tab identifiers and persist in the same versioned browser-local Preferences record. Pinned tabs move into a stable leading region that remains available when ordinary tabs overflow. Both the strip and **All tabs** surface label pinned state; pinned entries carry an explicit bulk-close protection marker for future close actions.

Each tab also has keyboard-reachable move controls in both the strip and **All tabs**. Their direction follows the rendered axis, their interactive target is at least 44 by 44 pixels, and localized labels keep compact inactive tabs named when their visible text is hidden. The complete six-tab order persists locally and drives the strip, **All tabs**, and command-palette destination order. Moves stay within the tab's current pinned or ordinary region, preserving the stable pinned boundary and initiating-control focus. The navigation and tablist names, plus reorder results naming the tab and new position, follow the active language mode. See [Tab reordering](tab-reordering.md).

This slice does not implement groups, bulk close, or the remaining group/window discovery searches; those remain separate incomplete contracts rather than implied behavior.

Tone controls style voice, not facts. Preview boundaries, release state, version data, platform names, checksums, and warning facts remain exact.

## Configuration

Preferences use the versioned browser-storage key `winforge-material-preview-preferences-v1` and an internal `schemaVersion: 1` record. The shipped defaults are English, English tone 2, Cantonese tone 3, system theme, comfortable density, left tabs, no pinned tabs, the shipped six-tab order, accent `#2f7d45`, and decorative message emoji enabled. Legacy records without the pin list migrate to an empty list, and records without an order migrate to the shipped order. Malformed pin lists or incomplete, duplicate, or unknown order entries are rejected with the rest of the record. Valid records are reconstructed from an explicit top-level allowlist; unknown stored properties are not persisted again.

Emoji decoration never changes notification/status text, controls, accessible names, release facts, checksums, platform names, or warnings. English, Cantonese, and bilingual Settings copy names the same preference.

The personal-vocabulary cache shares this versioned record but remains separately bounded and validated. It never stores source file metadata and never rewrites URLs, release facts, checksums, platform names, commands, accessible names, or public records. See [Personal vocabulary JSON](personal-vocabulary.md).

All eight presentation preferences also participate in [Global defaults and project overrides](project-settings-overrides.md). The private vocabulary cache does not.

## Failure modes

Missing or corrupt stored JSON is discarded and the site returns to shipped defaults. Storage failure must not block page rendering. Reset changes site preferences only and never alters the desktop application.

## Security and privacy

Stored data contains presentation choices only. It contains no credential, system setting, private path, analytics identifier, or synchronized account value.

## Verification

The initial source implements loading, persistence, live application, and reset paths. The ultra-speed bootstrap does not claim browser interaction testing or cross-browser persistence proof.

## Suggested articles

- [Landing page](landing-page.md)
- [Search and regex builder](search-and-regex.md)
- [Tab pinning](tab-pinning.md)
- [Tab reordering](tab-reordering.md)
