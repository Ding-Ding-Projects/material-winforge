# Toy locks and Support Tickets

The landing surface provides a bounded, local toy-lock wizard for major site targets: Site Settings, Documentation, Feature map, and the desktop Settings target. Each target has an independent credential hash and salt, an explicit unlock duration (until reload, 15 minutes, 1 hour, or 24 hours), and a visible locked state. Locked targets remain discoverable in the Settings search and command palette and say that unlocking is required.

Toy locks are a self-imposed UX speed bump. They are not security, encryption, authentication, or data protection. Only salted hashes are persisted in browser storage; plaintext credentials are cleared after use and never enter exports, history, logs, or network requests. Relocking is always available.

Recovery is self-service. For the site, clear this site's browser storage and reload. For the desktop app, delete its local application-data folder. The product never deletes either location for the user.

Support Tickets is a fictional local recovery desk. It stores a bounded category, description, severity, status, and local timestamp, and provides the same recovery path. A plain disclosure states that no ticket exists outside this device, no network request is made, no data is collected, and nobody is reading it. It never contacts a support service or deletes data.

Verification boundary: source changes and copy are present; runtime interaction, tests, lint, captures, and packaged desktop verification remain unverified for this slice.

Suggested articles: [School mode](school-mode.md), [Local preferences](preferences.md), and [Settings history](settings-history.md).
