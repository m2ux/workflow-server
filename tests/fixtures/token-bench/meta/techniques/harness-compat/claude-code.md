---
metadata:
  version: 1.0.0
---

## Capability

Invocation details for `harness_kind: claude-code` — the alternate operation rules, and this harness's standing wait policy.

## Rules

### spawn

Spawn a context on claude-code and wait for it to return. A dispatch that is not awaited leaves its result unread.

### resume

Continue an existing claude-code context by its identity, so the delivery ledger that identity holds still applies.

### concurrent

Emit every member of a concurrent group in one turn on claude-code, so the group runs together rather than in sequence.
