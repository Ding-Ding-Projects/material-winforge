# Local Status Hub

The Status tab is a local, interactive projection of the evidence this landing and documentation surface can actually read. It shows the manifest-provided commit, release version, tag, asset state, and a bounded set of evidence lanes. Each lane expands to show its evidence boundary and next required check.

## Behavior

- The release manifest is read from the versioned local asset path and validated by the existing manifest contract.
- The dashboard reports the current commit and release only when the manifest supplies them; unavailable values stay unavailable.
- Filters are keyboard- and touch-operable and expose All, Verified, Waiting, and Unavailable states.
- Lane disclosure buttons keep their expanded state in the current page session and announce `aria-expanded` and the controlled region.
- A heartbeat shows when the local manifest read last completed.

## Honest delivery boundary

This site does not have an authenticated Status Hub reply channel. It cannot send an answer, update a shared inbox, or prove a remote verdict. The fallback notice says this explicitly and directs the user to copy local facts into chat when needed. No credentials, network delivery, or external verdict is invented.

## Verification

The implementation is source-level only for this lane. Tests, lint, runtime interaction, captures, deployment, and external Status Hub delivery remain unrun and unverified.

Suggested articles: [Release downloads](../release/release-downloads.md), [Changelog](changelog.md), and [Landing page](landing-page.md).
