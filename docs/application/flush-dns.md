# Flush DNS

## Behaviour

**Flush DNS** is the one dashboard quick action in this slice that performs a real operating-system operation. The renderer sends no arguments. The Electron main process invokes exactly `ipconfig.exe` with the fixed argument array `['/flushdns']` through `execFile` with `shell: false`.

The process is hidden, limited to ten seconds, and limited to 128 KiB of captured output. Command output is never returned to the renderer. IPC returns schema version 1 with one bounded state—`flushed`, `unsupported`, `timeout`, or `failed`—and a safe message.

The renderer displays success only after receiving `flushed`. Unsupported, timeout, failed, malformed-response, missing-bridge, and rejected-request paths display explicit non-blocking notifications that tell the user to choose **Flush DNS** again to retry.

## Platform boundary

The operation is Windows-only. Other platforms return `unsupported` without starting a process. The bridge accepts no executable, path, argument, shell string, environment value, user input, or credential.

## Other quick actions

**Empty Recycle Bin**, **Restart Explorer**, **Winget upgrade**, and **New snapshot** remain visibly labelled preview actions. They show a factual preview notice and perform no file, shell, package, service, or history mutation.

## Privacy and security

The result contains no command output, paths, user names, host names, network addresses, resolver contents, or device data. A duplicate in-progress request is refused as a retryable failure rather than starting a second `ipconfig.exe` process.

## Verification

The accelerated pass built and packaged the Electron application. Tests, actual DNS flushing, timeout/retry interaction, UI interaction, installer execution, and screenshots were not run, so runtime behaviour remains unverified.

## Suggested articles

- [Read-only system metrics](read-only-system-metrics.md)
- [Preview boundary](preview-boundary.md)
