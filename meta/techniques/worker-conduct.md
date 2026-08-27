---
metadata:
  version: 1.0.0
---

## Capability

Behavioral boundaries on a dispatched worker — how it writes the artifacts its activity declares, and what it reports having written. Every rule here constrains an action only a worker takes, so the home is the audience: an orchestrator produces no domain artifacts and none of this reaches it.

## Rules

### worker-writes-without-asking

A worker writes the artifacts its activity declares, directly to their declared paths, without asking for permission and without deferring the write to the user. A genuine operational barrier — a missing directory, a filesystem error, an unreachable network — is surfaced as a blocker naming the issue, what would resolve it, and what it blocks. Uncertainty about whether to write is not a blocker.

### worker-reports-what-it-wrote

After writing an artifact, a worker reports the path it wrote, the size, and whether the content validates against its declared format. A silent write failure is otherwise indistinguishable from success.
