# Desktop Ollama suite manager

The design reference mirrors the site’s local-only contract: bounded health/version/tag reads, clear stopped and offline states, and explicit refusal to claim cloud, payment, or arbitrary-shell capabilities. The current desktop design is a reference surface; no packaged runtime behavior is claimed by this lane.

The browser-equivalent surface is documented in [the site article](../site/ollama.md). The desktop contract uses the same documented loopback endpoints for health, installed-tag reconciliation, bounded pull, and local chat, with cancellation and explicit missing/stopped/offline recovery copy. Variant-level catalog records, refresh provenance, stale/offline status, and conservative fit verdicts are now represented in the shared source model. Runtime tests, screenshots, and packaged interaction remain unverified; a browser surface cannot claim VRAM telemetry.
