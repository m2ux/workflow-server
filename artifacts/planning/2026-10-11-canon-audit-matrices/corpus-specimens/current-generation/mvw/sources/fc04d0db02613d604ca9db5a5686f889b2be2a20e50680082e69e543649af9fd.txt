---
metadata:
  version: 1.0.0
---

## Capability

The next question for one elicitation domain, narrowed to what the record does not already answer.

## Inputs

### current_domain

The question domain this question is drawn from, one of those the [Question Domain Reference](../../resources/requirements-elicitation.md#question-domain-reference) sets out.

### elicitation_log

*(optional)* The questions asked and the answers given so far. Empty on the first question of a run.

### stakeholder_baseline

The stakeholder discussion the questions build on, or the recorded limitation that none was held.

## Outputs

### current_question

One open question for `{current_domain}`, phrased so the answer carries the stakeholder's framing rather than the asker's.

## Protocol

### 1. Narrow the Domain

- Take `{current_domain}`'s probes from the [Question Domain Reference](../../resources/requirements-elicitation.md#question-domain-reference) and set aside the ones `{stakeholder_baseline}` and `{elicitation_log}` already answer

### 2. Compose the Question

- Compose `{current_question}` from the probes that remain, one question and no more, following the [Question Discipline](../../resources/requirements-elicitation.md#question-discipline)
  > Where every probe for the domain is already answered, `{current_question}` names the domain as covered so the gate can move past it.
