# Site app-logo customization

## Behavior

The Pages Settings surface offers three shipped treatments of the existing local WinForge brand asset: Forge, Tile, and Mono. A visitor may instead choose one private local PNG or JPEG. The active choice applies immediately to the site header and desktop-preview title bar and persists in the versioned browser-local Preferences record.

This setting changes presentation only. It never changes the product name, package identity, release manifest, download URL, storage keys, or any installed application identity.

## Custom-image validation

The semantic file picker accepts PNG and JPEG candidates up to 256 KiB. Validation inspects the actual PNG or JPEG signature instead of trusting the filename, rejects a declared MIME type that disagrees with the bytes, decodes locally, and requires dimensions from 16 through 2048 pixels per side with at most four million decoded pixels. Unsupported, empty, malformed, oversized, or mismatched images do not replace the last valid selection.

Animated formats, SVG, remote URLs, and network conversion are not accepted. The validated browser data URL is bounded and revalidated when Preferences load. No source filename or local path is stored.

## States and controls

The surface reports no-custom, loaded, and invalid states, provides replace and reset actions, and keeps the prior valid logo on failure. Reset returns to the shipped Forge mark. Preset and file controls are keyboard reachable, screen-reader labelled, localized for English, Cantonese, and bilingual modes, and indexed by the command palette.

## Privacy and verification

All decoding, validation, persistence, and rendering happen locally in the browser with no upload, analytics, or network request. Site builds and publication preflight verify compilation and publication boundaries. Runtime file selection, cache corruption, keyboard interaction, image decoding failures, narrow layouts, and visual captures remain unverified in this ultra-fast implementation pass.
