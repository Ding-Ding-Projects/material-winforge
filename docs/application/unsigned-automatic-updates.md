# Unsigned automatic updates

## Behaviour

The installed Electron application checks its public HTTPS release feed 30 seconds after startup and every six hours thereafter. A visible **Check for updates** command starts the same privileged main-process route manually. Renderer code receives redacted state only; it never receives update credentials or file-system access.

The updater exposes checking, available, downloading, ready, up-to-date, failed, offline, invalid-metadata, corrupt-package, cancelled, deferred, installing, unsaved-work-paused, and rollback-guidance states. Feed metadata and package hashes are validated by the Squirrel-compatible updater before the ready state appears.

When a validated update is ready, the persistent non-blocking banner names its version, links its release notes, states that the artifact is unsigned, and offers **Restart to install update** and **Later**. The renderer persists its local preferences before requesting restart. A reported unsaved-work condition prevents restart and keeps the update staged.

## Configuration

The privileged updater explicitly selects the public GitHub provider for `Ding-Ding-Projects/material-winforge`, so it does not depend on an ungenerated packaged configuration file. Automatic download is enabled; automatic installation on ordinary application exit is disabled. Installation occurs only after the explicit restart action. Pre-release and downgrade updates are disabled.

## Failure and recovery

- Offline and timeout failures keep the current version active.
- Invalid release metadata never becomes an available update.
- Integrity or package-hash failures are reported as corrupt and are not staged.
- The active update request can be cancelled while the updater exposes a cancellation token.
- A failed installed version cannot be silently downgraded. The rollback action explains that manual recovery through the public release history is required.

## Security

Code signing is permanently disabled. HTTPS transport, release metadata, and package hashes provide transport and integrity checks, but the application does not claim publisher authenticity or signature verification. No secret is embedded in renderer code, release assets, or source history.

## Verification

The accelerated bootstrap built the unpacked application and unsigned Squirrel.Windows artifacts. Tests, installer execution, update-server interaction, restart installation, rollback, and UI interaction were not run, so runtime update behaviour remains unverified.

## Suggested articles

- [Preview boundary](preview-boundary.md)
- [Release downloads](../release/release-downloads.md)
