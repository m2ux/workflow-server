---
metadata:
  version: 1.0.0
---

## Capability

Produce an inspectable ordered execution plan of steps for the goal — the plan half of plan-and-execute.

## Inputs

### goal

Goal to plan against.

### context

*(optional)* Constraints, inventory, or prior state the planner should honour.

## Outputs

### execution_plan

Object with `steps`: ordered array of `{ id, instruction, depends_on? }` and optional `notes`.

### plan_needs_replan

Boolean, default `false`. Set `true` only when planning itself detects the world is too unstable to execute (rare); normally `false` until replan or execute-plan-step surfaces surprise.

## Protocol

1. Decompose `{goal}` into an ordered list of mostly-independent executable steps using `{context}` when present.
2. Emit `{execution_plan}` with stable step ids and explicit `depends_on` when a step requires a prior step's product.
3. Leave `{plan_needs_replan}` false unless planning cannot produce a credible plan.
