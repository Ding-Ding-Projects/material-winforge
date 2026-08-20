# Built-in authenticator

The landing page provides a bounded, local TOTP authenticator. A user can register a standards-shaped `otpauth://totp/` URI or enter an issuer, account, and Base32 secret manually. The page validates the secret alphabet, issuer/account bounds, algorithm (`SHA-1`, `SHA-256`, or `SHA-512`), 6/8 digits, and a 15–120 second period before storing it.

Codes are generated in the browser with Web Crypto HMAC and the RFC 6238 counter calculation. Each entry shows the current code, seconds remaining in the period, and a next-code countdown cue. Entries are searchable by issuer or account and can be removed individually or cleared together. The command palette routes directly to the authenticator card.

Storage is bounded browser-local storage, not an operating-system credential vault. It is convenience, not security. Secrets never appear in ordinary redacted JSON exports or settings history. This build has no declared local QR renderer, so it does not render a QR image and never calls a remote QR service. No network request is needed for registration or code generation.

## Failure modes and recovery

Malformed URIs, unsupported algorithms, invalid Base32, overlong labels, duplicate IDs, invalid periods, and oversized records are rejected without partial application. Clearing the page's local storage removes the local entries. Clearing all entries is explicit and does not affect any external account.

## Verification boundary

The source lane records implementation only. Tests, lint, runtime interaction, QR decoding, captures, accessibility review, packaging, release, and publication remain unrun for this bounded change.

Suggested articles: [Search and regex builder](search-and-regex.md), [Local site preferences](site-preferences.md), [Preview boundary](preview-boundary.md).
