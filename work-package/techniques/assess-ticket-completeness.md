---
metadata:
  version: 1.0.0
---

## Capability

Assess a tracker ticket across five issue-quality dimensions — problem statement, goal, scope, acceptance criteria, and user stories — document the gaps found, and offer to refactor the ticket to close them.

## Inputs

### ticket_details

Summary, description, and context of the tracker ticket being assessed (the linked issue's fields).

### assumptions_log

*(optional)* The existing assumptions [log](../resources/assumptions-review.md#assumptions-log-template), where documented gaps are recorded.

## Outputs

### ticket_gaps_documented

True once any identified gaps have been recorded (in the assumptions log) so they persist as tracked findings.

### ticket_refactor_needed

True when the user elects to refactor the ticket to address the identified gaps; false when they choose to proceed with gaps noted or the ticket is complete.

## Protocol

### 1. Assess the Dimensions

- Evaluate the `{ticket_details}` across five issue-quality dimensions: problem statement, goal, scope, acceptance criteria, and user stories.
- Judge each dimension as present and sufficient, present but weak, or missing.

### 2. Document Gaps

- For each dimension that is weak or missing, record the gap concisely as a tracked finding in `{assumptions_log}`.
- Set `{ticket_gaps_documented}` once the gaps are recorded.

### 3. Offer to Refactor

- Present the gaps to the user and offer to refactor the ticket to address them.
- Set `{ticket_refactor_needed}` from the user's decision: true to refactor, false to proceed with gaps noted or when no significant gaps were found.

## Rules

### gaps-are-tracked-findings

Documented gaps are persistent findings, not ephemeral status text — they live in the assumptions log so review can proceed with them visible regardless of whether the ticket is refactored.
