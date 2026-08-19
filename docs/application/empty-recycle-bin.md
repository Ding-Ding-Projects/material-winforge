# Empty Recycle Bin

The dashboard's **Empty Recycle Bin** action is a real, Windows-only destructive operation. It permanently deletes all current Recycle Bin contents. WinForge cannot recover those contents afterward.

## Confirmation

Selecting the action opens a blocking confirmation in the renderer. The surface names the permanent impact and requires three separate steps:

1. Confirm that every Recycle Bin item will be permanently deleted.
2. Confirm that WinForge cannot recover the deleted contents.
3. Move the authorization slider to 100%.

The slider remains disabled until both checks are complete. **Emergency exit**, clicking the scrim, or pressing <kbd>Escape</kbd> cancels before execution. Once execution starts, the controls remain disabled until Windows returns a result, preventing duplicate submission. Progress is expressed with text and a numeric progress bar; it does not depend on animation or color. A successful result has a distinct completion state.

## Privileged boundary

The renderer cannot provide an executable, path, shell string, command option, or other input. It can only invoke the no-input `winforge:empty-recycle-bin` bridge.

On Windows, the main process launches `powershell.exe` without a shell and with one fixed argument list:

```text
-NoProfile -NonInteractive -Command Clear-RecycleBin -Force -ErrorAction Stop
```

The process is hidden and has bounded execution time and output buffering. Duplicate operations are refused. The renderer receives only schema version 1, one of `emptied`, `unsupported`, `timeout`, or `failed`, and a bounded safe message. Command output, paths, usernames, host information, environment data, and credentials never cross the bridge.

## Failure and retry

Unsupported, timeout, invalid-response, and failure states appear as non-blocking retryable notifications. Success appears only after the main process returns `emptied`; starting the command never counts as success.

## Verification boundary

The source build and unsigned packaging route may be run for this change. The action itself must not be exercised during build verification because doing so would permanently delete user data. Runtime interaction, installer execution, tests, lint, static analysis, visual review, and screenshots are outside this ultra-speed slice.
