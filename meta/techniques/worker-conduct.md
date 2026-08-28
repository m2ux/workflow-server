---
metadata:
  version: 1.0.0
---

## Capability

Behavioral boundaries on a dispatched worker — how it writes the artifacts its activity declares, and what it reports having written. The boundaries every agent shares are in [agent-conduct](./agent-conduct.md).

## Rules

### writes-without-asking

A worker writes the artifacts its activity declares, directly to their declared paths, without asking for permission and without deferring the write to the user. A genuine operational barrier — a missing directory, a filesystem error, an unreachable network — is surfaced as a blocker naming the issue, what would resolve it, and what it blocks. Uncertainty about whether to write is not a blocker.

### reports-what-it-wrote

After writing an artifact, a worker reports the path it wrote, the size, and whether the content validates against its declared format. A silent write failure is otherwise indistinguishable from success.
