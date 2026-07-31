---
metadata:
  version: 1.0.0
---

## Capability

Single-question unit of the domain-iteration elicitation loop.

## Inputs

### current_domain

The question domain for this iteration; one question is posed from it per [requirements-elicitation](../../resources/requirements-elicitation.md).

### elicitation_log

The record of questions asked and responses given so far, which this iteration extends.

## Outputs

### elicitation_log

The record of questions asked and responses given, carried in from the prior iteration with this one's question and response appended.

### elicitation_complete

Boolean signal — set true when the user signals completion; otherwise elicitation continues (answered or skipped).


## Protocol

### 1. Ask Question

- Pose one question from the current domain (per [requirements-elicitation](../../resources/requirements-elicitation.md))
- Record the response and adapt the follow-up based on the answer
- Skip irrelevant follow-ups; probe deeper when needed
- Skip option always available — user can say 'skip' to move to the next question
