---
metadata:
  version: 2.1.2
---

## Capability

The authoritative open questions on the comprehension log.

## Inputs

### comprehension_log

The log whose open questions are revised; its existing questions and the findings from the latest targeted investigation drive which are resolved and which are added.

## Outputs

### comprehension_log

The log with its open questions revised — resolved questions naming the deep dive that answered them, newly discovered questions added as open, and out-of-scope items recorded under out of scope. Its open set is the authoritative unresolved-question set.


## Protocol

### 1. Question Management

- Revise the open questions and the out-of-scope items in `{comprehension_log}`, in the shape the [Comprehension Log Template](../../resources/codebase-comprehension.md#comprehension-log-template) defines
- Mark resolved questions as resolved with a one-line resolution and the deep dive that answered them
- Add new questions discovered during investigation as open — questions naturally emerge from tracing data flows, examining edge cases, and reading adjacent code
- Record questions identified but out of scope for the current work package as out-of-scope items
