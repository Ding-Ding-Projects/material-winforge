# Site documentation browser

## Behavior

The Documentation tab presents the checked-in site article catalog locally. Selecting an article keeps the reader on the site route; Suggested articles are real in-page navigation controls that clear the active filter and open the selected article. The selected article, query, and plain-text/regex mode are retained in bounded browser storage when that storage is available.

## Search and configuration

Search covers article titles, bilingual titles, article section headings and body text, and suggested-article labels. Plain text is the default. The adjacent anchored Regex builder deliberately enables the browser JavaScript `RegExp` dialect, exposes flags, guided tokens, sample text, match counts, and capture groups, and keeps invalid patterns inline with zero results. Search state is limited to 128 characters and is never sent over the network.

## Failure modes and privacy

An empty catalog or a query with no result renders a truthful no-article state; it never opens a guessed article or claims a match. If browser storage is unavailable or full, the Documentation tab remains usable and the page says that selection changes may last only until reload. Article text is shipped with the site, and query/sample data stays local to the current page.

## Verification boundary

This slice proves source-level local article routing, article-text search, regex error handling, persistence bounds, and accessible empty states. The packaged site interaction, tests, lint, and screenshots remain unrun in this implementation lane.

## Suggested articles

- [Search and regex builder](search-and-regex.md)
- [Landing page](landing-page.md)
- [Local preferences](preferences.md)
