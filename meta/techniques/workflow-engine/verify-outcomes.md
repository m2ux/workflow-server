---
metadata:
  version: 1.4.0
---

## Capability

Compare a workflow's declared `outcomes` against state and identify gaps.

## Inputs

### outcomes

Array of expected outcome strings to evaluate.

### session_state

The session's variable bag.

### execution_trace

Completed activities and the event history behind them.

## Outputs

### gaps

Array of unsatisfied outcomes

## Protocol

1. Resolve the outcome list to evaluate: prefer a non-empty `{outcomes}` binding when supplied; otherwise fall back to the calling activity's declared `outcome:` list. Outcome strings are plain declarative prose — never encode or parse conditional predicates inside them. When a producing step was structurally gated out on the path taken, skip the outcomes that step would have satisfied rather than reporting them as unmet gaps.
2. For each entry in that list, evaluate satisfaction against `{session_state}`, artifact presence in `planning_folder_path`, and `{execution_trace}`; collect every unmet item into `{gaps}`.
