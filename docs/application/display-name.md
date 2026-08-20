# Desktop display name

The desktop Settings design reference provides a bounded **App display name** editor. It accepts a 1–64 character local label, applies it to the custom title bar and the notification/snackbar introduction surfaces, and offers one-click reset to `WinForge · Material 3 Preview`.

## Identity boundary

The display label is intentionally separate from stable package identity. It never changes the executable name, installer identity, application-data folder, update feed, or diagnostic/package records. Diagnostics keep the shipped identity so a renamed local presentation cannot make support evidence ambiguous.

## Failure and persistence

Whitespace-only, overlong, and control-character input is rejected with the prior valid value retained. The allowlisted local preview record persists the label and migrates missing values to the shipped name. The command palette and Settings search expose the exact editor and reset action. No network or credential path is involved.

## Verification boundary

This is source/design-reference evidence only. Packaged runtime interaction, tests, lint, accessibility review, and screenshots were not run in the accelerated implementation lane.

Suggested articles: [Preview boundary](preview-boundary.md), [Global defaults and project overrides](project-settings-overrides.md), and [Desktop app-logo customization](app-logo.md).
