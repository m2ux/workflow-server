---
metadata:
  version: 1.0.0
---

## Capability

Analyse the goal (and optional context) into an ordered work-units list — the runtime decomposition half of orchestrator-workers.

## Inputs

### goal

Task or request to decompose.

### context

*(optional)* Additional context (paths, prior findings, constraints) that shapes decomposition.

### effort_cap

*(optional)* Maximum number of work units to emit. When set, prefer fewer, broader units over exceeding the cap.

## Outputs

### work_units

Ordered array of `{ id, brief, tools_hint? }`. `id` is a stable slug; `brief` is a self-contained worker instruction; `tools_hint` names suggested tools when useful.

## Protocol

1. Read `{goal}` and `{context}`; decide the minimum set of independent subtasks that cover the goal without overlap.
2. Emit `{work_units}` in execution preference order. Honour `{effort_cap}` when present.
3. Each `brief` must be executable without sibling briefs or the parent's chain of thought.
