---
metadata:
  version: 1.5.0
---

## Capability

Compare a workflow's declared `outcomes` against state and identify gaps.

## Inputs

### outcomes

Array of expected outcome strings to evaluate.

### session_state

The session's variable bag.

### execution_trace

Completed activities and the event history behind them, including the outcome each completed activity reported.

## Outputs

### gaps

Array of unsatisfied outcomes

## Protocol

1. Resolve the outcome list to evaluate: prefer a non-empty `{outcomes}` binding when supplied; otherwise take the outcome each completed client activity reported, which `{execution_trace}` carries per activity. Outcome strings are plain declarative prose — never encode or parse conditional predicates inside them. When a producing step was structurally gated out on the path taken, skip the outcomes that step would have satisfied rather than reporting them as unmet gaps.
2. For each entry in that list, evaluate satisfaction against `{session_state}`, artifact presence in `planning_folder_path`, and `{execution_trace}`; collect every unmet item into `{gaps}`.
3. Report which of the two sources the list came from, so a reader knows whether the run was measured against a list the workflow seeded or against what its activities reported as they completed.

## Rules

### the-client-workflow-owns-the-outcomes

The list measures the client workflow the session ran, so both sources name that workflow's outcomes: a binding the client workflow seeded, or the outcomes its own activities reported as they completed. The closing activity's own `outcome:` list describes closure — a summary presented, a trace persisted — and measuring a run against it reports on the act of closing rather than on the work, which is a pass no client workflow can fail.
