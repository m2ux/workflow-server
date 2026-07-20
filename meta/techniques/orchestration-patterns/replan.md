---
metadata:
  version: 1.0.0
---

## Capability

Revise `{execution_plan}` in light of `{replan_reason}` and `{prior_step_results}`, producing a new plan for remaining work.

## Inputs

### goal

Original goal.

### execution_plan

Plan that failed or surprised during execution.

### prior_step_results

Results already obtained (keep successful work; do not redo without cause).

### replan_reason

Why replanning was requested.

## Outputs

### execution_plan

Replacement plan for remaining work (may include completed steps as already-done markers in `notes`).

### plan_needs_replan

Set `false` after a successful replan emit.

## Protocol

1. Incorporate `{prior_step_results}` and `{replan_reason}` into a revised decomposition of `{goal}`.
2. Emit a new `{execution_plan}` that preserves completed useful work and schedules only remaining steps.
3. Set `{plan_needs_replan}` to false.
