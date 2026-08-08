---
metadata:
  version: 1.1.0
---

## Capability

Whether a user request states intent to carry on prior work.

## Inputs

### user_request

User's free-form request.

## Outputs

### resume_intent_requested

True when the request states intent to carry on prior work, false otherwise.

## Protocol

1. Match `{user_request}` against the affirmative phrases in [resume-intent-lexicon](../../../meta/resources/resume-intent-lexicon.md), applying that resource's matching rule and its negative cases, and emit `{resume_intent_requested}`.
