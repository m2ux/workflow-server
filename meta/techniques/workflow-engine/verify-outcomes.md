---
metadata:
  version: 1.2.0
---

## Capability

Compare a workflow's declared `outcomes` against state and identify gaps.

## Inputs

### outcomes

Array of expected outcome strings from the workflow definition (or a mode-seeded substitute such as `{target_workflow_outcomes}`)

### state

Current variable state and completed-activities trace

## Outputs

### gaps

Array of unsatisfied outcomes

## Protocol

1. Resolve the outcome list to evaluate: prefer a non-empty `{outcomes}` binding when supplied; otherwise use `{target_workflow_outcomes}` from `{state}` when present (mode-seeded at intake / start-work-package when the client branches on a mode variable); otherwise fall back to the client activity `outcome:` lists. Outcome strings are plain declarative prose — never encode or parse mode predicates such as `When is_review_mode…` inside them. When a producing step was structurally gated out for the active mode (e.g. `is_review_mode != true` create-path steps while review mode is active), skip the corresponding create-path outcomes rather than reporting them as unmet gaps.
2. For each entry in that list, evaluate satisfaction against state variables, artifact presence in `planning_folder_path`, and the completed-activities trace; collect every unmet item into `{gaps}`.
   > Read the state variables and completed-activities trace through the `inspect_session` tool (`view: variables` and `view: activities`, or `view: summary` for both) rather than reading `session.json` directly. When `inspect_session` disagrees with a just-completed worker envelope for a critical path, prefer the envelope and planning-folder evidence (same reconcile stance as [dispatch-activity](./dispatch-activity.md#distrust-then-reconcile)).
