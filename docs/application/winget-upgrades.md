# Reviewed Winget upgrades

## Scope

The real upgrade path accepts only selected, explicitly updatable Winget catalog rows. The main process owns the immutable allowlist: `Git.Git`, `Microsoft.PowerShell`, and `GitHub.cli`. Renderer input is a unique array of one to ten exact allowlisted IDs. Every unknown, duplicate, oversized, non-Winget, install-only, or non-updatable selection is rejected before process execution.

## Review confirmation

**Review Winget upgrades** opens a renderer-owned confirmation listing each exact package name and ID. It states that Winget will download and install those packages and that running applications may close or request a restart. Cancel closes the review without IPC. During execution the decision controls are replaced by bounded progress and **Cancel upgrades**.

The real review action appears only while the current engine-discovery result marks Winget **Available**. If Winget is not checked, not installed, timed out, or unavailable, stale queued IDs remain local preview selections and the button stays **Preview queue**; no real review modal opens.

## Fixed execution

Each package runs sequentially through direct `execFile` with `shell: false`, a hidden process window, a fifteen-minute timeout, a 1 MiB output cap, and an internal cancellation signal. Arguments are fixed as:

```text
upgrade --id <allowlisted-id> --exact --accept-source-agreements --accept-package-agreements
```

No raw output crosses IPC. Aggregate states are `completed`, `partial`, `cancelled`, `unsupported`, `timeout`, or `failed`. Per-item results contain only the allowlisted ID and `completed`, `cancelled`, `unsupported`, `timeout`, or `failed`.

Progress events contain schema version 1, processed count, total count, current allowlisted ID, and bounded status. Duplicate concurrent operations are refused. Cancellation takes no renderer input and aborts the active process before marking unfinished items cancelled.

## Queue behaviour

Completed IDs are removed from the local queue. Unsuccessful, timed-out, cancelled, and unavailable IDs remain selected for review and retry. Each unsuccessful item receives a factual retryable notification.

Non-Winget rows, install rows, and rows without an explicit update marker remain preview-only. Selecting or previewing them runs no package manager and changes no package.

## Privacy and security

The main process accepts no executable, engine, argument, path, shell string, environment value, source URL, credential, or arbitrary package ID. IPC returns no command output, installation path, user name, host data, package source content, or credential.

## Verification

The accelerated pass built and packaged the Electron application. Tests, confirmation interaction, actual Winget execution, cancellation, timeout, partial result handling, installer execution, and screenshots were not run, so runtime behaviour remains unverified.

## Suggested articles

- [Package engine discovery](package-engine-discovery.md)
- [Preview boundary](preview-boundary.md)
