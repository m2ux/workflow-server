---
metadata:
  version: 1.0.0
---

## Capability

Compare a workflow's declared `outcome[]` against state and identify gaps.

## Inputs

### outcome

Array of expected outcome strings from the workflow definition

### state

Current variable state and completed-activities trace

## Output

### gaps

Array of unsatisfied outcomes

## Protocol

1. For each `{outcome}`, evaluate satisfaction against state variables, artifact presence in `planning_folder_path`, and the completed-activities trace; collect every unmet item into `{gaps}`.
