# Unlock ladder

The desktop design contract includes a local waiting aid for toy-lock lockouts. It is deliberately not an authentication factor: clearing WAITING never clears a credential, creates a session, or sets a cookie.

With School mode off, the first rung is a four-choice dim-sum challenge. Five wrong dishes move to ten easy sums. One wrong sum moves to an eight-second whack-a-mole round; early submission is rejected and a lost round falls to a clock-only state. School mode starts at sums and omits the dim-sum rung. Expiry, nonce replay, and the bounded rolling-hour ladder budget are explicit failure boundaries.

This design reference does not claim packaged runtime interaction. No network or credential path is part of the ladder.

Suggested articles: [Toy locks and Support Tickets](toy-locks.md), [School mode](school-mode.md), [Local snapshot history](local-snapshot-history.md).
