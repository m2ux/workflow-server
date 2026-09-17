---
metadata:
  version: 1.0.0
---

## Capability

Invocation details for `harness_kind: cline` — the alternate operation rules, and this harness's standing wait policy.

## Rules

### spawn

Spawn a context on cline and wait for it to return. A dispatch that is not awaited leaves its result unread.

### resume

Continue an existing cline context by its identity, so the delivery ledger that identity holds still applies.

### concurrent

Emit every member of a concurrent group in one turn on cline, so the group runs together rather than in sequence.
