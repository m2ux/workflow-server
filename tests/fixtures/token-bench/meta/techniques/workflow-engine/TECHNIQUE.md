---
metadata:
  version: 1.0.0
---

## Capability

Traversal of a workflow graph: dispatching activities, reading exits, resolving gates and persisting what a run produced.

## Rules

### agent-id-scopes-delivery

What has already been delivered is scoped to an agent context rather than to the session, so every delivery call carries `agent_id`. A context calling for the first time receives bodies; the same context calling again receives markers for what it already holds.

### variable-mutation-source

Variables mutate from two sources only: a checkpoint option effect, and a worker's reported `variables_changed`. Never through ad-hoc reasoning.
