# Unlock ladder

The desktop design/runtime reference includes a local waiting aid for toy-lock lockouts. It is deliberately not an authentication factor: clearing WAITING never clears a credential, creates a session, or sets a cookie. The state is transient except for a bounded rolling-hour ladder-use counter.

With School mode off, the first rung is a four-choice dim-sum challenge. Five wrong dishes move to ten easy sums. One wrong sum moves to an eight-second whack-a-mole round; early submission is rejected and a lost round falls to a clock-only state. School mode starts at sums and omits the dim-sum rung from the rendered surface. Each challenge carries a single-use nonce and a 60-second expiry; a rolling hour permits at most three ladder starts, while the original lockout attempt budget is never refunded or increased. Expiry, nonce replay, early submission, and the bounded budget are explicit failure boundaries.

The reference now wires the rung transitions, nonce consumption/rotation, expiry, timed-round boundary, clock-only fallback, School-mode start, and local budget into its state model. No network, credential, token, cookie, or session path is part of the ladder. The desktop package has not been independently exercised, so packaged runtime interaction remains unverified.

Suggested articles: [Toy locks and Support Tickets](toy-locks.md), [School mode](school-mode.md), [Local snapshot history](local-snapshot-history.md).
