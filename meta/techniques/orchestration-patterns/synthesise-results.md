---
metadata:
  version: 1.0.0
---

## Capability

Combine gathered results into a single synthesis under caller-supplied criteria — the consolidate half of orchestrator-workers / lead-researcher / supervisor aggregate.

## Inputs

### gathered_results

Ordered keyed collection of per-unit worker outputs (at least `items`).

### synthesis_criteria

Instructions for how to reconcile, dedupe, weight, or structure the combined answer (report shape, conflict policy, citation rules).

### goal

*(optional)* Original goal for framing the synthesis.

## Outputs

### synthesis

The combined result text or structured object per `{synthesis_criteria}`.

## Protocol

1. Read `{gathered_results.items}` in order; skip null/empty slots or note them as gaps per `{synthesis_criteria}`.
2. Reconcile conflicts using `{synthesis_criteria}` (and `{goal}` when present).
3. Emit `{synthesis}` only — do not re-dispatch workers from this op.
