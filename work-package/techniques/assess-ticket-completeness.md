---
metadata:
  version: 1.0.0
---

## Capability

Tracker-ticket quality across problem, goal, scope, acceptance criteria, and user stories — gaps and optional refactor.

## Inputs

### ticket_details

Summary, description, and context of the tracker ticket being assessed (the linked issue's fields).

### assumptions_log

*(optional)* The existing assumptions [log](../resources/assumptions-review.md#assumptions-log-template), where documented gaps are recorded.

## Outputs

### ticket_gaps_documented

True once any identified gaps have been recorded (in the assumptions log) so they persist as tracked findings; false when every dimension is present and sufficient.

## Protocol

### 1. Assess the Dimensions

- Evaluate the `{ticket_details}` across five issue-quality dimensions: problem statement, goal, scope, acceptance criteria, and user stories.
- Judge each dimension as present and sufficient, present but weak, or missing.

### 2. Document Gaps

- For each dimension that is weak or missing, record the gap concisely as a tracked finding in `{assumptions_log}`.
- Set `{ticket_gaps_documented}` true once gaps are recorded, false when every dimension is present and sufficient.
- Documented gaps are persistent findings, not ephemeral status text — they live in the assumptions log so review can proceed with them visible regardless of whether the ticket is refactored.
