# Package engine discovery

## Behaviour

The Package Manager surface asks the Electron main process for one read-only engine inventory after mount. The renderer sends no input. The main process owns fixed executable candidates for WinGet, Scoop, Chocolatey, pip, npm, .NET tools, PowerShell Gallery, PSResourceGet, Cargo, Bun, and vcpkg.

Discovery reuses the bounded `where.exe` implementation: direct `execFile`, `shell: false`, a three-second timeout per candidate, 64 KiB output cap, hidden process window, absolute-path validation, existing-file validation, and exact candidate-basename validation. Searches for different engines run concurrently; each engine's candidate list remains bounded.

IPC returns schema version 1 plus each fixed engine identifier and one of four states: **Available**, **Not installed**, **Unavailable (timeout)**, or **Unavailable**. It returns no executable path, environment value, user name, host name, version guess, or device data. Before the response arrives, the renderer says **Not checked**.

PowerShell Gallery and PSResourceGet remain **Unavailable** in this slice. Finding `pwsh.exe` or `powershell.exe` would not prove that either package module is installed, so the implementation makes no module-availability claim until a separate fixed, bounded module probe is added.

## Preview queue boundary

The **Preview queue** action changes no packages. It reports the count of locally selected demonstration rows and explicitly states that no package manager ran and no package was fetched, installed, updated, removed, or otherwise mutated.

## Failure modes

Missing executable candidates produce **Not installed**. A bounded discovery timeout produces **Unavailable (timeout)**. A missing discovery facility, unsupported platform, malformed IPC response, or bridge failure produces **Unavailable**. These states never silently become available.

## Verification

The accelerated pass built and packaged the Electron application. Tests, live engine discovery, UI interaction, package-manager execution, installer execution, and screenshots were not run, so runtime discovery and presentation remain unverified.

## Suggested articles

- [External app launch](external-app-launch.md)
- [Preview boundary](preview-boundary.md)
