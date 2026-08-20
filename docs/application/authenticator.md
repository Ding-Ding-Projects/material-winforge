# Built-in authenticator

The desktop design/runtime now provides a first-class bounded local authenticator surface for TOTP entries. It accepts an `otpauth://totp/` URI or manual Base32 secret, validates issuer/account bounds, supports SHA-1/SHA-256/SHA-512, 6/8 digit codes, and 15–120 second periods, then generates RFC 6238-compatible codes locally with Web Crypto HMAC. The surface shows the current code, a readable seconds-remaining countdown, issuer/account search, remove/clear actions, and a redacted JSON export.

Registration accepts a TOTP `otpauth://` URI or Base32 secret, with issuer/account metadata and bounded algorithm, digit, and period choices. Secret material is excluded from ordinary exports and history records. After registration, the URI is held transiently in memory as the local QR/text registration contract: the desktop surface provides a copyable `otpauth://` text alternative and never calls a remote QR service. Persistence is limited to the app's bounded local preview record; this lane does not claim an operating-system credential vault.

The runtime intentionally caps entries at 50 and input at 512 characters. Invalid schemes, non-TOTP URIs, malformed Base32, unsafe characters, unsupported algorithms/digits, and out-of-range periods are rejected without partial state. The next-code value is derived from the same period boundary as the current code; no secret, URI payload, or code is sent over the network, written to history, or included in the ordinary export.

Verification boundary: no tests, lint, runtime interaction, captures, accessibility review, packaging, release, or publication were run for this lane.

Suggested articles: [Site authenticator](../site/authenticator.md), [Narration](narration.md), [Local version history](local-version-history.md).
