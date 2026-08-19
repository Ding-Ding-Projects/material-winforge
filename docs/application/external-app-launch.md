# External app launch

## Behaviour

The External App Launcher can discover and open fifteen supported installed applications. The renderer supplies only a fixed application identifier. A privileged main-process map owns every permitted executable candidate name.

Discovery invokes `where.exe` directly with an argument array, a three-second timeout, a 64 KiB output cap, hidden execution, and `shell: false`. A candidate is usable only when the returned value is an absolute existing file whose basename exactly matches the fixed candidate. The main process then calls `shell.openPath` for that discovered file.

The renderer displays success only after the main process reports that `shell.openPath` completed without an error. Missing, timed-out, cancelled, busy, invalid, and failed launches have distinct factual states. Duplicate launches for the same application identifier are refused while discovery is active.

## Fixed identifiers

The allowlist covers Visual Studio Code, GitHub Desktop, LibreOffice, Blender, GIMP, Inkscape, Krita, darktable, OBS Studio, Audacity, HandBrake, Shotcut, VirtualBox, Docker Desktop, and Wireshark. Renderer-supplied executable names, paths, arguments, shell strings, and environment changes are never accepted.

## Install boundary

The **Install chain (preview)** action remains a preview. It displays a non-blocking notice and does not invoke WinGet, another package manager, a browser, or a shell. This slice adds installed-app launching only.

## Privacy and security

IPC results contain a schema version, the fixed application identifier, a bounded status, and a bounded message. They contain no discovered path, user name, host name, environment value, or device data. Cancellation uses an internal `AbortController`; timeout and discovery failures degrade without crashing the desktop process.

## Verification

The accelerated pass built and packaged the Electron application. Tests, installed-app discovery, actual launches, cancellation, timeout interaction, UI interaction, installer execution, and screenshots were not run, so runtime behaviour remains unverified.

## Suggested articles

- [Preview boundary](preview-boundary.md)
- [Read-only system metrics](read-only-system-metrics.md)
