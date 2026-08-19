# Changelog viewer

## Behavior

The desktop Changelog destination bundles the five newest published WinForge releases available when this catalogue was authored: `v1.0.31` through `v1.0.35`. Every entry records the published calendar date, neutral **Release** category, exact commit subject as its summary, full commit SHA, and immutable GitHub commit URL. No entry is synthesized from unreleased work.

The viewer provides a bounded plain-text search with its own adjacent anchored JavaScript regex builder, typed ISO start/end date controls, an honest no-match state, local clipboard copy, and local Markdown export of exactly the filtered entries.

## Data boundary

The catalogue is static source data and requires no network request. Dates and commit facts remain exact and never pass through personal-vocabulary replacement or funny-level styling. Copy and export include version, date, category, summary, and full commit URL; they contain no path, credential, host detail, private setting, or diagnostic data.

## Verification boundary

Source and unsigned package builds may be exercised for this slice. Navigation, plain/regex search, invalid regex, ISO boundaries, no-match, clipboard, export, commit-link opening, accessibility, and rendered facts remain runtime-unverified. Tests, lint, reviews, audits, installer execution, and screenshots were not part of this ultra-speed lane.
