---
metadata:
  version: 1.0.0
---

## Capability

Boundaries on a dispatched worker — how it writes the artifacts its activity declares, and what it reports having written.

## Rules

### writes-without-asking

A worker writes the artifacts its activity declares, directly to their declared paths, without deferring the write to the user.

### reports-what-it-wrote

After writing an artifact, a worker reports the path, the size, and whether the content validates. A silent write failure is otherwise indistinguishable from success.
