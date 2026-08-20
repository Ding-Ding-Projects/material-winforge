# Local Ollama suite manager

## Behavior

The Features surface reads only `http://127.0.0.1:11434/api/version` and `/api/tags`. Requests are GET-only, bounded to two seconds, and response bodies are capped at 512 KiB. The result shows the local version and up to 200 verified installed tags. It never launches a process, accepts arbitrary shell text, calls a cloud model service, or introduces payment semantics.

## Configuration

Installed tags have a plain-text search by default. The adjacent anchored regex builder explicitly opts into the browser JavaScript `RegExp` dialect, with `i` and `m` flags, sample text, syntax feedback, match count, and capture display. Tag names, size, and modified time come from the local API; missing metadata remains labelled as not reported.

## Variant catalog and hardware fit

The catalog cards are variant-level records from the verified local `/api/tags` response. Each record keeps its digest, blob size, modified time, parameter-size and quantization metadata when Ollama supplies them, plus an explicit installed flag. The refresh record names `Local Ollama /api/tags`, stores an ISO timestamp, reports whether the bounded 200-record response was complete, and marks the last catalog stale when the loopback service is offline or the refresh is more than 24 hours old. No catalog entry is invented while offline.

The catalog has independent Installed-only and fit-verdict filters. The hardware evidence shown beside it is conservative browser evidence: `navigator.deviceMemory` for RAM, the browser storage estimate for free quota, and an explicit unknown VRAM value because this surface cannot inspect a GPU. A model is **Runs well**, **Runs with limits**, **Unlikely**, or **Unknown** only from reported blob size, context, RAM, disk, and available metadata. Missing required evidence produces **Unknown**; a model name or parameter label alone never becomes a promise.

## Failure modes

Stopped/missing Ollama, loopback timeout, non-OK responses, malformed JSON, oversized responses, cancelled pulls, and timed-out chat remain explicit status states. An empty list before a successful refresh is not presented as a healthy empty catalogue.

The site-equivalent operation cards use only documented local endpoints: `GET /api/version`, `GET /api/tags`, `POST /api/pull`, and `POST /api/chat`. Pulls and chat requests are bounded to 30 seconds and 512 KiB responses; a fresh operation cancels the previous request, and a cancelled or timed-out request never reports success. After a pull, the user is told to refresh tags so installed state is reconciled from Ollama rather than guessed.

Model pulls accept a bounded model-tag grammar and never accept shell text. Chat requires an installed-model selection and bounds prompts and responses. The harness preview lists only shipped local profiles (health probe or local chat); it intentionally cannot register or launch arbitrary executables in this browser surface.

## Security and privacy

Only loopback URLs are used. The surface does not collect credentials, prompts, model payloads, history, exports, telemetry, or remote URLs. No local response is persisted, and no payment or cloud semantics are presented. Hardware values are read only for the visible conservative fit explanation and are never sent anywhere.

## Verification boundary

This lane proves the source-level bounded catalog model, refresh/stale/offline states, filters, and conservative verdict calculation. Tests, lint, packaged interaction, and screenshots remain unverified; VRAM remains explicitly unavailable in the browser equivalent.

Suggested articles: [Search and regex builder](search-and-regex.md), [Preview boundary](landing-page.md).
