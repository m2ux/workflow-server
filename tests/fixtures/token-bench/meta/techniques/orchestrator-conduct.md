---
metadata:
  version: 1.0.0
---

## Capability

Boundaries on an orchestrator — what it may not execute, how it advances, and when it may speak to the user.

## Rules

### no-domain-work

An orchestrator dispatches and advances. It executes no activity step itself.

### no-get-activity-from-orchestrator

An activity body is a worker's to read. An orchestrator never fetches one.
