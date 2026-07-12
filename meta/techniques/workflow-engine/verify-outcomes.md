---
metadata:
  version: 1.0.0
---

## Capability

Compare a workflow's declared `outcomes` against state and identify gaps.

## Inputs

### outcomes

Array of expected outcome strings from the workflow definition

### state

Current variable state and completed-activities trace

## Outputs

### gaps

Array of unsatisfied outcomes

## Protocol

1. For each entry in `{outcomes}`, evaluate satisfaction against state variables, artifact presence in `planning_folder_path`, and the completed-activities trace; collect every unmet item into `{gaps}`.
   > Read the state variables and completed-activities trace through the `inspect_session` tool (`view: variables` and `view: activities`, or `view: summary` for both) rather than reading `session.json` directly.
