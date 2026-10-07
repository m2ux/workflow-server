---
metadata:
  version: 2.2.0
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

### 1. Normalise Briefs

- Normalise `{worker_briefs}` into ordered `{ description, prompt }` entries, keeping each brief's id alongside.

### 2. Spawn Each Agent

- For each brief in order, apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-agent](../harness-compat/spawn-agent.md) with that brief's prompt; append each `{ id, result }` to `{dispatched_results}`.

### 3. Record Gap Results

- Record empty or failed slots in `{dispatched_results}`; do not invent results.

## Rules

### one-worker-at-a-time

Briefs are dispatched one after another, in the calling worker's own turn. Running the units together is a graph destination, not a dispatch from this turn.
