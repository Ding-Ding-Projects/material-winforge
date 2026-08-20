# Built-in authenticator

The desktop design reference now reserves a first-class authenticator surface for local TOTP entries. It documents URI/manual registration, live current-code and countdown presentation, redacted exports, and explicit local-only limits. The design reference intentionally does not claim that the desktop runtime or an operating-system credential vault is implemented by this lane.

Registration accepts a TOTP `otpauth://` URI or Base32 secret, with issuer/account metadata and bounded algorithm, digit, and period choices. Secret material is excluded from ordinary exports and history records. A QR renderer is not declared in the current design artifact, so no QR service or new network dependency is introduced.

Verification boundary: no tests, lint, runtime interaction, captures, accessibility review, packaging, release, or publication were run for this lane.

Suggested articles: [Site authenticator](../site/authenticator.md), [Narration](narration.md), [Local version history](local-version-history.md).
