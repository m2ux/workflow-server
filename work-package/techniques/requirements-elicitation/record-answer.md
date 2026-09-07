---
metadata:
  version: 1.0.0
---

## Capability

The elicitation record extended with one question and the answer given to it.

## Inputs

### current_domain

The domain the question was drawn from, recorded against the entry.

### current_question

The question that was posed.

### domain_answered

Whether an answer was given, or the domain was passed over.

### elicitation_log

*(optional)* The record so far, which this entry extends. Empty on the first question of a run.

## Outputs

### elicitation_log

The record carried in with this question, its domain and its answer appended as one entry.

## Protocol

### 1. Record the Entry

- Append one entry to `{elicitation_log}` carrying `{current_domain}`, `{current_question}` and the answer as given, in the row shape the [Document Template](../../resources/requirements-elicitation.md#document-template) sets for its Elicitation Log
  > Where `{domain_answered}` is false the entry records the question and that the domain was passed over, so a later pass sees the domain was reached rather than missed.

### 2. Summarise the Answer

- Reduce the answer to the response summary the log's row admits, keeping the specifics a requirement would be built from and dropping the conversational remainder
  > A vague answer is recorded as given rather than sharpened, per the [Question Discipline](../../resources/requirements-elicitation.md#question-discipline) — it becomes an assumption, and the assumptions log is where that is settled.
