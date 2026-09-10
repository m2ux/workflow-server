---
metadata:
  version: 2.0.0
---

## Capability

Dispatch an ordered set of worker briefs one at a time, inside the calling worker, and return harness results in input order.

## Inputs

### worker_briefs

Ordered array of `{ id, description, prompt }`.

## Outputs

### dispatched_results

Array of `{ id, result }` in `{worker_briefs}` order. `result` is the harness agent output text (or structured payload when the worker returned one). Completeness counts live on gather-results.

## Protocol

1. Normalise `{worker_briefs}` into harness `{agents}` entries `{ description, prompt }`, preserving order and ids alongside.
2. For each brief in order, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with that brief's prompt; append each `{ id, result }` to `{dispatched_results}`.
3. Record empty or failed slots in `{dispatched_results}`; do not invent results.

## Rules

### one-worker-at-a-time

Briefs are dispatched one after another, in the calling worker's own turn. Running work units together is the graph's business: bind the exit that reaches the per-unit activity to a destination naming that activity and the collection to run it over, and the run opens one worker per element. That route gives each unit its own frontier entry, its own slot in the branch container and its own identity, none of which a worker dispatching from inside its own turn can offer.
