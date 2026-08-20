# Site display name

The Pages Settings surface provides a bounded, browser-local **App display name** control. A visitor can choose a 1–64 character label, apply it to the live document title, header brand, footer introduction, notification/snackbar introductions, About/preview copy, and command-palette discovery, or reset to `WinForge · Material 3 Preview`.

## Configuration and persistence

The value is stored in the allowlisted `winforge-material-preview-preferences-v1` record. Whitespace-only, overlong, and control-character values are rejected without changing the previous valid label. Legacy records without the field migrate to the shipped label; unknown fields are discarded. The command palette and top-level Settings search route directly to the control.

## Identity and privacy boundary

This is a presentation label only. It never changes package identifiers, the application-data location, executable or installer names, update feeds, release metadata, or diagnostic records. Diagnostic and package evidence continues to use the shipped identity so support records remain unambiguous. The label stays in browser-local state and is not uploaded, exported as a credential, or used as an external identity.

## Verification boundary

The source implementation and site/publication preflights are the evidence for this lane. Tests, lint, runtime interaction, accessibility review, and screenshots remain unrun in the accelerated implementation lane.

Suggested articles: [Local preferences](preferences.md), [Global defaults and project overrides](project-settings-overrides.md), and [Rich command palette](command-palette.md).
