# External editor handoff

The desktop Settings surface provides a bounded external-editor handoff for projects and exported files. It discovers only the shipped editor identifiers and fixed Windows install locations: Visual Studio Code (`Code.exe`/`code.exe`) and Notepad++ (`notepad++.exe`) on `PATH`, plus their standard per-user or machine install locations.

The user can select an installed editor and persist that selection in the app's private application data. The **Open in selected editor** action accepts an absolute file or folder path and passes it as one argument to the selected executable. It rejects URLs, relative paths, control characters, oversized input, unknown editor identifiers, and non-file/non-folder targets. No shell string, arbitrary executable, download, or installation action is accepted.

Visual Studio Code is the preferred export handoff. Export-producing surfaces can pass their validated destination path to the same bridge; the editor is not treated as a required dependency. If it is absent, the Settings surface reports that state and leaves the export untouched. A missing bridge, unsupported platform, discovery timeout, persistence failure, or launch failure is surfaced as a non-blocking status and never reported as opened.

The bridge validates editor IDs, fixed candidate paths, target paths, file/folder type, and bounded execution. Preference writes are schema-versioned and private. No target contents, credentials, command strings, or environment values are persisted or sent over a network.

Verification boundary: source, IPC validation, documentation, and publication preflights are run for this slice. Tests, lint, packaged runtime interaction, editor launch, accessibility review, and screenshots remain unrun by the accelerated lane.

Suggested articles: [Preview boundary](preview-boundary.md), [Local snapshot history](local-snapshot-history.md), and [File converter](file-converter.md).
