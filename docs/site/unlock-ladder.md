# Unlock ladder

The landing surface includes a local, bounded waiting aid for toy-lock lockouts. It is not authentication: winning clears waiting only, never a credential, cookie, token, or session.

The ladder starts with one dim-sum choice and four answers when the local School mode is off. Five wrong dishes advance to ten easy single- or double-digit sums. One wrong sum advances to a timed whack-a-mole round; the round cannot be submitted before its full duration. Losing that round falls back to the clock and the ladder is not offered again for that lockout. School mode starts directly at the sums, so the hidden dim-sum rung is not named or exposed.

Challenges are local-only and bounded by a single-use nonce, expiry, a rolling hourly ladder budget, and the original attempt budget. Replayed or expired challenges are rejected, early timed submissions are rejected, and serving the clock restores only the normal attempt budget. No network request or secret handling is involved.

## Failure and recovery

An expired challenge, exhausted budget, wrong answer, or lost round leaves the user with the clock-only route. Clearing browser storage resets the site's toy-lock UX state; the ladder cannot unlock the credential it protects.

Suggested articles: [Toy locks and Support Tickets](toy-locks.md), [School mode](school-mode.md), [Destructive confirmation](destructive-confirmation.md).
