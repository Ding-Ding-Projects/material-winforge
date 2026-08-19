# Local School mode

School mode is a user-renamable, local presentation mode for the landing and documentation site. When enabled, the site immediately uses English-only copy and removes the funny-level controls, personal-vocabulary controls, and dim-sum content from its discoverable surface. The user's earlier language, tone, vocabulary, and dim-sum choices remain stored and return when the mode is turned off.

## Configuration and recovery

Settings and the `Ctrl+Shift+F` command palette expose the mode. The user chooses a display name and a local unlock credential. Only a random salt and SHA-256 hash produced by Web Crypto are persisted in `localStorage`; plaintext credential input is never written. The mode is a UX lock, not security, encryption, or access control.

If the credential is forgotten, clear this site's browser storage and reload. That local reset is the supported recovery path; no network request, account, support ticket, or remote credential is involved.

## Failure modes and privacy

Malformed or incomplete mode records fall back to the disabled shipped state. If Web Crypto is unavailable, enabling is refused with an honest notification. A wrong unlock credential leaves the mode enabled and clears only the attempted input. The site does not send the mode name, credential, hash, salt, or prior choices over the network.

## Verification boundary

This article documents the source contract. Tests, lint, runtime interaction, accessibility review, and captures are unverified for this implementation slice.

## Suggested articles

- [Local site preferences](preferences.md)
- [Search and regex builder](search-and-regex.md)
- [Settings history](settings-history.md)
