# Restart Explorer

## Confirmation

Selecting **Restart Explorer** opens a renderer-owned blocking confirmation. It states that Explorer windows will close and restart and that unsaved File Explorer work may be interrupted. **Cancel** closes the confirmation without calling IPC or changing application state. **Restart Explorer** disables both decision buttons while the operation runs and invokes the no-input privileged bridge exactly once.

## Fixed operation

The main process supports Windows only and runs two fixed commands in order:

1. `taskkill.exe` with `['/F', '/IM', 'explorer.exe', '/T']`.
2. `explorer.exe` with no arguments through a fixed, detached `spawn` call.

`taskkill.exe` uses direct `execFile`, `shell: false`, a hidden process window, a ten-second timeout, and a 128 KiB output cap. The long-lived Explorer process uses `spawn` with `shell: false`, a hidden detached process, ignored standard streams, and a five-second startup-event deadline; it is not incorrectly failed for remaining alive after startup. A duplicate in-progress request is refused. The renderer cannot supply an executable, path, argument, shell string, environment value, or credential.

IPC returns schema version 1 with only `restarted`, `unsupported`, `timeout`, or `failed` plus a bounded safe message. It returns no command output, path, user data, process list, host data, or environment detail.

## Failure and retry

Success appears only after Explorer has been stopped and the fixed restart process emits its successful spawn event. Unsupported, timeout, failed, malformed-response, missing-bridge, and rejected-request paths show factual non-blocking notifications that tell the user to choose **Restart Explorer** again to retry.

## Quick-action boundary

**Flush DNS** and confirmed **Restart Explorer** are real. **Empty Recycle Bin**, **Winget upgrade**, and **New snapshot** remain visibly marked preview actions and perform no mutation.

## Verification

The accelerated pass built and packaged the Electron application. Tests, actual Explorer termination or restart, confirmation interaction, timeout/retry interaction, installer execution, and screenshots were not run, so runtime behaviour remains unverified.

## Suggested articles

- [Flush DNS](flush-dns.md)
- [Preview boundary](preview-boundary.md)
