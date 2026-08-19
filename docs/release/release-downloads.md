# Release downloads

## Behavior

The site reads `pages/public/release-manifest.json`. The installer action is enabled only when the record has schema version 1, status `published`, and a real asset URL. The default committed record is `unavailable` and keeps the action disabled.

## Configuration

The published schema is:

```json
{
  "schemaVersion": 1,
  "status": "published",
  "version": "1.0.0",
  "tag": "v1.0.0",
  "commit": "full commit SHA",
  "platform": "Windows x64",
  "assetName": "versioned setup executable name",
  "url": "immutable HTTPS release-asset URL",
  "sha256": "lowercase SHA-256",
  "size": 123456,
  "publishedAt": "UTC ISO-8601 timestamp"
}
```

Publication must derive these fields from the exact non-draft GitHub release and selected artifact rather than from intended names or a moving “latest” URL.

## Failure modes

- Missing, malformed, unsupported, candidate, or unavailable metadata disables the installer action.
- A URL without a matching real release asset is invalid even if it returns content.
- A zero-byte asset is not downloadable proof.
- A build from another commit is superseded and must never populate the manifest.
- A signature must not be invented; Windows packages are intentionally unsigned.

## Security and privacy

The manifest contains public release metadata only. It must never contain a credential, token, local path, private host, temporary upload URL, or signing claim. Release notes and the site disclose that unsigned packages may trigger unknown-publisher or SmartScreen warnings.

## Verification

Before changing status to `published`, independently confirm:

1. The intended tag resolves to the selected candidate commit.
2. A non-draft GitHub release exists for that tag.
3. Every required Squirrel.Windows asset is attached.
4. Each expected asset has a nonzero size and download URL.
5. The selected installer’s SHA-256 and size match the manifest.

This bounded proof does not mean the installer was executed, the app was launched, or the interface was visually inspected.

## Suggested articles

- [Preview boundary](../application/preview-boundary.md)
- [Landing page](../site/landing-page.md)
