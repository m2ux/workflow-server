---
metadata:
  version: 1.0.0
---

## Capability

Execute one current step from an execution plan and record its result, signalling whether the plan still holds.

## Inputs

### current_step

The step object `{ id, instruction, depends_on? }` to execute.

### execution_plan

Full plan for dependency context.

### prior_step_results

*(optional)* Ordered results of completed steps, keyed or listed by step id.

## Outputs

### step_result

Object `{ id, outcome, evidence? }` for `{current_step.id}`.

### prior_step_results

`{prior_step_results}` with `{step_result}` appended — the accumulated per-step history landed back into the bag for the next iteration and for replan to read.

### plan_needs_replan

`true` when execution discovers the plan is wrong, blocked, or missing a dependency that planning assumed; otherwise `false`.

### replan_reason

*(optional)* Short reason when `{plan_needs_replan}` is true.

## Protocol

1. Execute `{current_step.instruction}` using available tools and `{prior_step_results}` when needed.
2. Emit `{step_result}` with the outcome.
3. Append `{step_result}` onto `{prior_step_results}` (create the list when absent) — never overwrite a prior step's entry. Downstream loop iterations and [replan](./replan.md) read the accumulated history.
4. If the world differs from the plan (missing resource, failed precondition, contradictory evidence), set `{plan_needs_replan}` true and `{replan_reason}`; otherwise set `{plan_needs_replan}` false.
