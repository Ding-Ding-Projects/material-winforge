# Desktop destructive-action confirmation

The desktop surface uses one blocking super-confirmation pattern for destructive or materially disruptive actions. The current Windows actions covered by this contract are **Restart Explorer** and **Empty Recycle Bin**. Each confirmation names the exact action, affected data, and irreversible impact before any privileged bridge call is made.

## Confirmation contract

Each surface requires two independently operated acknowledgement checkboxes and a separate full-range authorization slider. The slider stays disabled until both acknowledgements are complete, and the operation starts only when the slider reaches 100%. A second submit is refused while the bridge is running.

**Emergency exit**, the scrim, and <kbd>Escape</kbd> cancel before execution, clear the pending acknowledgements, reset the slider, and return focus to the originating action. Progress is reported with readable text and a numeric progress bar; color and animation are not the only status signals. The reduced-motion media rule removes transition and dialog animation without changing the safety steps or facts.

Restart Explorer states that Explorer windows close and restart and that unsaved File Explorer work may be interrupted and cannot be recovered by WinForge. Empty Recycle Bin states that all current Recycle Bin contents are permanently deleted and cannot be recovered. The bridge remains the only mutation path.

## Failure and privacy boundaries

Missing, unsupported, timeout, malformed-response, rejected-request, and failed-bridge results remain non-blocking notifications with a retry action. No action is described as complete before the bridge returns its validated result. Confirmation state is renderer-local and never contains credentials, paths, or private vocabulary data.

## Verification boundary

This lane updates the desktop source contract and documentation. Tests, lint, reviews, packaged runtime interaction, accessibility review, and captures were not run. The desktop build and publication preflights are the available local evidence; runtime behavior remains unverified until the built artifact is driven.

## Suggested articles

- [Restart Explorer](restart-explorer.md)
- [Empty Recycle Bin](empty-recycle-bin.md)
- [Reviewed Winget upgrades](winget-upgrades.md)
- [Local snapshot history and restore](local-snapshot-history.md)
