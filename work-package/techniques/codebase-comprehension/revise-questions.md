---
metadata:
  version: 2.0.0
---

## Capability

Authoritative Open Questions on the comprehension log after a deep-dive.

## Inputs

### comprehension_log

The log whose Open Questions are revised; its existing table and the findings from the latest targeted investigation drive which questions are resolved and which are added.

## Outputs

### open_questions

The revised Open Questions set in `{comprehension_log}` — resolved questions cross-referenced to the section that answered them, newly discovered questions added as open, and out-of-scope items listed separately. This is the authoritative unresolved-question set; `{has_open_questions}` is true while any remain.


## Protocol

### 1. Question Management

- Revise the Open Questions table and the follow-up list in `{comprehension_log}`, in the shape the [Comprehension Log Template](../../resources/codebase-comprehension.md#comprehension-log-template) defines
- After each deep-dive iteration, mark resolved questions as resolved with a one-line summary and a cross-reference to the deep-dive section that answered them
- Add new questions discovered during investigation as open — questions naturally emerge from tracing data flows, examining edge cases, and reading adjacent code
- Record questions identified but out of scope for the current work package as follow-up items
