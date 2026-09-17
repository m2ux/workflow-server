---
metadata:
  version: 1.0.0
---

## Capability

Invocation details for `harness_kind: cursor` — the alternate operation rules, and this harness's standing wait policy.

## Rules

### spawn

Spawn a context on cursor and wait for it to return. A dispatch that is not awaited leaves its result unread.

### resume

Continue an existing cursor context by its identity, so the delivery ledger that identity holds still applies.

### concurrent

Emit every member of a concurrent group in one turn on cursor, so the group runs together rather than in sequence.
