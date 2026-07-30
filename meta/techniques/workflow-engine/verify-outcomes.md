---
metadata:
  version: 1.3.0
---

## Capability

Compare a workflow's declared `outcomes` against state and identify gaps.

## Inputs

### outcomes

Array of expected outcome strings to evaluate.

## Outputs

### gaps

Array of unsatisfied outcomes

## Protocol

1. Resolve the outcome list to evaluate: prefer a non-empty `{outcomes}` binding when supplied; otherwise fall back to the calling activity's declared `outcome:` list. Outcome strings are plain declarative prose — never encode or parse conditional predicates inside them. When a producing step was structurally gated out on the path taken, skip the outcomes that step would have satisfied rather than reporting them as unmet gaps.
2. Resolve `{$state}`: the session's variables and completed-activities trace. For each entry in that list, evaluate satisfaction against `{state}`'s variables, artifact presence in `planning_folder_path`, and its completed-activities trace; collect every unmet item into `{gaps}`.
   > Read `{state}` through the `inspect_session` tool (`view: variables` and `view: activities`, or `view: summary` for both) rather than reading `session.json` directly. It is resolved here, never supplied by a caller — an orchestrator holding a stale copy of the bag is the disagreement the reconcile stance below exists for. When `inspect_session` disagrees with a just-completed worker envelope for a critical path, prefer the envelope and planning-folder evidence (same reconcile stance as [dispatch-activity](./dispatch-activity.md#distrust-then-reconcile)).
