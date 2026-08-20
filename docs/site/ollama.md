# Local Ollama suite manager

## Behavior

The Features surface reads only `http://127.0.0.1:11434/api/version` and `/api/tags`. Requests are GET-only, bounded to two seconds, and response bodies are capped at 512 KiB. The result shows the local version and up to 200 verified installed tags. It never launches a process, accepts arbitrary shell text, calls a cloud model service, or introduces payment semantics.

## Configuration

Installed tags have a plain-text search by default. The adjacent anchored regex builder explicitly opts into the browser JavaScript `RegExp` dialect, with `i` and `m` flags, sample text, syntax feedback, match count, and capture display. Tag names, size, and modified time come from the local API; missing metadata remains labelled as not reported.

## Failure modes

Stopped/missing Ollama, loopback timeout, non-OK responses, malformed JSON, and oversized responses remain explicit status states. An empty list before a successful refresh is not presented as a healthy empty catalogue.

## Security and privacy

Only loopback URLs are used. The surface does not collect credentials, prompts, model payloads, history, exports, telemetry, or remote URLs. No local response is persisted.

## Verification boundary

This lane is source-level only. Tests, lint, packaged interaction, hardware/storage telemetry, screenshots, release, and publication remain unverified.

Suggested articles: [Search and regex builder](search-and-regex.md), [Preview boundary](landing-page.md).
