# Desktop app-logo customization

The desktop Settings surface provides a local app-logo editor. It offers the shipped Forge mark plus three additional bundled presets, a 64-pixel live preview, a reset action, and a semantic local file picker for a custom PNG or JPEG. The editor also exposes keyboard-accessible focal-point crop coordinates, zoom, contain/cover/fill fit treatment, and transparent/surface/primary-container background treatment.

## Behavior and bounds

- Presets are bundled data and apply immediately to the custom title bar and the Settings preview.
- Custom files are accepted only when the declared MIME type and inspected bytes match PNG or JPEG signatures, the file is at most 512 KiB, and decoded dimensions are between 1 and 2048 pixels on each side.
- The local data URL cache is bounded to 360,000 characters. Decode failures, invalid signatures, oversized files, and invalid dimensions leave the previously valid logo active and report an invalid state.
- Custom-logo edits use schema-versioned presentation state: focal X/Y are 0–100%, zoom is 1–4, fit is `contain`, `cover`, or `fill`, and the background is `transparent`, `surface`, or `primary`. The renderer locally derives and validates 26px, 64px, and 128px PNG outputs for the title bar and previews.
- Derivative conversion is transactional. If canvas conversion, output validation, or the bounded derivative cache fails, the previous source, crop, and derived outputs remain active and the surface reports the conversion failure.
- Replace, reset, no-custom, loading, loaded, and invalid states are explicit. Reset restores the Forge mark.
- Product identity, package identifiers, installer identity, update feed, and application-data location are never derived from the selected display mark.

## Privacy and security

Image bytes stay in the renderer's bounded local storage record. No upload, network fetch, remote converter, source path, telemetry, or export payload is used. The picker is limited to PNG/JPEG and the prior valid logo remains active if validation fails. Display customization never changes the executable name, installer identity, update feed, or application-data location.

## Verification boundary

This implementation was built from the desktop reference source. The source contract includes keyboard-operable crop/focal controls, fit/background choices, derivative-size disclosure, rollback copy, persistence, and reset. Tests, lint, packaged runtime interaction, accessibility review, and screenshots were not run in the accelerated implementation lane; the source contract remains the evidence boundary.

## Suggested articles

- [Appearance editor](appearance-editor.md)
- [Global defaults and project overrides](project-settings-overrides.md)
- [Preview boundary](preview-boundary.md)
