---
metadata:
  version: 1.0.0
---

## Capability

Dispatch an ordered set of worker briefs sequentially or concurrently and return harness results in input order.

## Inputs

### worker_briefs

Ordered array of `{ id, description, prompt }` (and optionally bare `{ description, prompt }` for [spawn-concurrent](../harness-compat/spawn-concurrent.md)).

### concurrency

*(optional)* Positive integer. Default `1`. `1` = sequential [spawn-agent](../harness-compat/spawn-agent.md) per brief; greater than `1` = one [spawn-concurrent](../harness-compat/spawn-concurrent.md) batch.

## Outputs

### dispatched_results

Array of `{ id, result }` in `{worker_briefs}` order. `result` is the harness agent output text (or structured payload when the worker returned one). Completeness counts live on [gather-results](./gather-results.md).

## Protocol

1. Normalise `{worker_briefs}` into harness `{agents}` entries `{ description, prompt }`, preserving order and ids alongside.
2. If `{concurrency}` is `1` (or omitted): for each brief, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with that brief's prompt; append each `{ id, result }` to `{dispatched_results}`.
3. If `{concurrency}` > `1`: apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-concurrent](../harness-compat/spawn-concurrent.md) once with all agents; zip harness `results` back to brief ids in input order as `{dispatched_results}`.
4. Record empty or failed slots in `{dispatched_results}`; do not invent results.
