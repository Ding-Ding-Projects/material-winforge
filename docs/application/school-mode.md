# Local School mode

The desktop design/runtime surface carries a local, user-renamable School mode. Enabling it stores a salted Web Crypto SHA-256 credential hash, forces English-only presentation, and removes funny-level, personal-vocabulary, and dim-sum affordances while enabled. Disabling requires the local credential and restores the previous language and prior presentation choices.

This is a self-imposed UX mode, never security, encryption, authentication, or protection for sensitive data. Forgetting the credential is recoverable by clearing the app's local application data and reloading the preview. No credential plaintext is persisted, exported, logged, or sent to a service.

## Failure modes and verification

An invalid stored record falls back to the disabled state. A missing Web Crypto implementation or a wrong credential keeps the mode safely enabled and reports the next action. This source slice has not run tests, lint, packaged interaction, accessibility review, or captures.

## Suggested articles

- [Scheduled settings and external sources](scheduled-settings.md)
- [Personal vocabulary JSON](personal-vocabulary.md)
- [Preview boundary](preview-boundary.md)
