---
metadata:
  version: 1.0.0
---

## Capability

Requirements, success criteria and scope boundaries elicited across the question domains, with the question-and-response record behind them.

## Inputs

### elicitation_log

The questions posed across the domains and the answers given to them, as the record the elicited set is derived from.

### stakeholder_baseline

The stakeholder discussion the questions built on, or the recorded limitation that none was held.

## Outputs

### requirements

The captured requirements list elicited across the domains.

### success_criteria

The defined success criteria with verification methods.

### scope_boundaries

In/out scope definitions captured during elicitation.

## Protocol

### 1. Assemble the Elicited Set

- Emit `{requirements}`, `{success_criteria}` and `{scope_boundaries}` from the answers `{elicitation_log}` holds, read against `{stakeholder_baseline}` for what the discussion already settled
  > Where the log covers fewer domains than the reference sets out, the elicited set carries the coverage it has and the gap goes to the assumptions log as a scope assumption.
- Hold the set to the [Minimum Viable Elicitation](../../resources/requirements-elicitation.md#minimum-viable-elicitation) floor, so a light pass still yields a problem statement, a primary stakeholder, in-scope and excluded items, and success criteria
