# Desktop app-logo customization

The desktop Settings surface provides a local app-logo editor. It offers the shipped Forge mark plus three additional bundled presets, a 64-pixel live preview, a reset action, and a semantic local file picker for a custom PNG or JPEG.

## Behavior and bounds

- Presets are bundled data and apply immediately to the custom title bar and the Settings preview.
- Custom files are accepted only when the declared MIME type and inspected bytes match PNG or JPEG signatures, the file is at most 512 KiB, and decoded dimensions are between 1 and 2048 pixels on each side.
- The local data URL cache is bounded to 360,000 characters. Decode failures, invalid signatures, oversized files, and invalid dimensions leave the previously valid logo active and report an invalid state.
- Replace, reset, no-custom, loading, loaded, and invalid states are explicit. Reset restores the Forge mark.
- Product identity, package identifiers, installer identity, update feed, and application-data location are never derived from the selected display mark.

## Privacy and security

Image bytes stay in the renderer's bounded local storage record. No upload, network fetch, remote converter, source path, telemetry, or export payload is used. The picker is limited to PNG/JPEG and the prior valid logo remains active if validation fails.

## Verification boundary

This implementation was built from the desktop reference source. Tests, lint, packaged runtime interaction, accessibility review, and screenshots were not run in the accelerated implementation lane; the source contract remains the evidence boundary.

## Suggested articles

- [Appearance editor](appearance-editor.md)
- [Global defaults and project overrides](project-settings-overrides.md)
- [Preview boundary](preview-boundary.md)
