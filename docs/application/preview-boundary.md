# Preview boundary

## Behavior

WinForge · Material 3 Preview demonstrates the proposed information architecture, visual language, and interaction direction for a Windows desktop control center. Preview controls may change the rendered state inside the application without changing Windows.

The project website is a separate landing, documentation, status, settings, and download surface. It never becomes the desktop runtime.

## Configuration

Preview state belongs to the preview. A control must not claim to change Windows until a separate integration defines its exact target, permissions, recovery path, failure reporting, and verification.

The display name is distinct from stable package identity. Future user renaming must not move the application data directory, installer identity, update feed, or executable name.

## Failure modes

- An inert preview control must be labelled as a static preview rather than styled as a working system action.
- A failed real integration must report the exact failed operation and recovery action without inventing success.
- Missing runtime evidence must stay “unverified,” never “passed.”
- A website interaction must never be presented as desktop behavior.

## Security and privacy

Do not request administrator access, credentials, or system mutation for a source-only preview. Future privileged integrations require least privilege, explicit scope, reversible behavior where possible, and no credential logging.

Code signing is prohibited. Published Windows artifacts remain unsigned and must disclose the resulting unknown-publisher or SmartScreen warning.

## Verification

Source compilation or packaging is not runtime proof. Verification must eventually drive the real packaged artifact through the approved hidden desktop route, confirm the actual integration result through an independent channel, and capture the exact surface at the candidate commit.

The initial bootstrap does not claim tests, runtime interaction, installer execution, screenshots, or visual review.

## Suggested articles

- [Landing page](../site/landing-page.md)
- [Release downloads](../release/release-downloads.md)
