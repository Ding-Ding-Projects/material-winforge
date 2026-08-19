# Preview boundary

## Behavior

WinForge · Material 3 Preview demonstrates the proposed information architecture, visual language, and interaction direction for a Windows desktop control center. Most controls change only rendered preview state, but the package now includes a deliberately bounded set of privileged integrations: read-only system metrics, Flush DNS, confirmed Restart Explorer, confirmed Empty Recycle Bin, local JSON snapshots, and reviewed allowlisted Winget upgrades.

The persistent banner distinguishes those integrations from sample meters, preview data, and controls that still perform no operating-system or package mutation. It also states that build and packaging evidence is not runtime verification.

The project website is a separate landing, documentation, status, settings, and download surface. It never becomes the desktop runtime.

## Configuration

Preview state belongs to the preview. A control must not claim to change Windows until a separate integration defines its exact target, permissions, recovery path, and failure reporting. An implemented integration may be labelled live in source while its independent runtime evidence remains explicitly unverified.

The display name is distinct from stable package identity. Future user renaming must not move the application data directory, installer identity, update feed, or executable name.

## Failure modes

- An inert preview control must be labelled as a static preview rather than styled as a working system action.
- A failed real integration must report the exact failed operation and recovery action without inventing success.
- Missing runtime evidence must stay “unverified,” never “passed.”
- A website interaction must never be presented as desktop behavior.

## Security and privacy

Privileged integrations require least privilege, explicit scope, fixed or allowlisted inputs, reversible behavior where possible, and no credential logging. Preview-only controls must not request administrator access, credentials, or system mutation.

Code signing is prohibited. Published Windows artifacts remain unsigned and must disclose the resulting unknown-publisher or SmartScreen warning.

## Verification

Source compilation or packaging is not runtime proof. Verification must eventually drive the real packaged artifact through the approved hidden desktop route, confirm the actual integration result through an independent channel, and capture the exact surface at the candidate commit.

The first packaged runtime capture at `c0a5d72` discovered that the persistent banner still described every action as sample-only. The `b52cf34` repair was then launched as a packaged artifact on a fresh hidden desktop. One product window with class `Chrome_WidgetWin_1` was resolved; the corrected bounded-live banner was visually inspected; real CPU, memory, app-data-disk, and network values rendered; and the read-only metrics summary was clicked. Cleanup closed the owned process tree and hidden desktop.

That session verifies the repaired banner and the observed read-only metrics surface only. It does not verify installer execution, update installation, destructive actions, package mutation, tests, lint, type checking, or broader visual conformance.

## Suggested articles

- [Landing page](../site/landing-page.md)
- [Release downloads](../release/release-downloads.md)
