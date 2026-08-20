# In-app offline documentation browser

The desktop app bundles the checked-in `docs/application/*.md` and `docs/site/*.md` feature articles during `prepare:runtime`. The resulting `main-app-design/docs-browser-data.js` is shipped with the application, so the documentation browser works without a network request or a remote renderer.

## Behaviour

Open **Docs** from the navigation rail or the command palette. The left article list searches article titles, source labels, and Markdown body text. Plain-text matching is the default. The adjacent regex button opens the shared anchored regex builder, with the same query and JavaScript regular-expression dialect used by the other search fields. Selecting an article keeps the list and article view in one route, and local Markdown links navigate to another bundled article without opening a browser.

Markdown is escaped before rendering. Headings, paragraphs, lists, block quotes, fenced code, emphasis, inline code, and local article links are supported. Unknown or external links remain inert unless they are safe HTTPS links; the documentation surface cannot execute article-authored HTML or scripts.

## Configuration and failure modes

`main-app-design/scripts/generate-docs-browser.mjs` is the single build-time inventory. It reads both documentation categories, bounds each article to 180 KiB, rejects empty files and duplicate IDs, and fails when the article count is outside the bounded range. A missing or invalid bundle shows an explicit unavailable state rather than fetching a guessed URL.

The source article remains authoritative. The generated bundle is deterministic and is checked into the application package so a packaged install does not depend on the source checkout.

## Privacy and security

Search stays in renderer memory and is not sent over the network. Article text is treated as data, not instructions. The renderer uses an allowlisted local-link conversion and HTML escaping; it does not inject raw Markdown HTML. The Electron session blocks network requests except the existing approved release path.

## Verification boundary

The source inventory and package inclusion are implemented. Built-artifact interaction, accessibility review, and real capture evidence remain unverified for this lane.

## Suggested articles

[Search and full regex builder](../site/search-and-regex.md), [Changelog viewer](changelog-viewer.md), and [Preview boundary](preview-boundary.md).
