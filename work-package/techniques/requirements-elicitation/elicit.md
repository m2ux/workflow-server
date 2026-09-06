---
metadata:
  version: 1.0.0
---

## Capability

Requirements, success criteria and scope boundaries elicited across the question domains, with the question-and-response record behind them.

## Inputs

### question_domains

The question domains to iterate one question at a time (per the [Question Domain Reference](../../resources/requirements-elicitation.md#question-domain-reference)).

### stakeholder_baseline

The stakeholder discussion the questions build on, or the recorded limitation that none was held.

## Outputs

### requirements

The captured requirements list elicited across the domains.

### success_criteria

The defined success criteria with verification methods.

### scope_boundaries

In/out scope definitions captured during elicitation.

### elicitation_log

Record of the questions asked and the responses given across the domain iteration.

## Protocol

### 1. Iterate Domains

- Use attached [Question Domain Reference](../../resources/requirements-elicitation.md#question-domain-reference) for question domains, narrowing each domain's questions to what `{stakeholder_baseline}` leaves unanswered
- Iterate through domains one question at a time
- Record responses and adapt follow-up based on answers
- Skip irrelevant follow-ups; probe deeper when needed

### 2. Assemble the Elicited Set

- Emit `{requirements}`, `{success_criteria}` and `{scope_boundaries}` from the recorded responses, and `{elicitation_log}` as the question-and-response record behind them
