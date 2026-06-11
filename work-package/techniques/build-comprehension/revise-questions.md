---
metadata:
  version: 1.0.0
---

## Capability

Maintain the 'Open Questions' section of the comprehension artifact after a deep-dive: resolve answered questions, add newly discovered ones, and track out-of-scope follow-ups. This is the authoritative list of unresolved questions that drives the comprehension-sufficiency decision.

## Inputs

### comprehension_artifact

The comprehension artifact whose 'Open Questions' section is revised; its existing table and the findings from the preceding [deep-dive](./deep-dive.md) drive which questions are resolved and which are added.

## Outputs

### open_questions

The revised 'Open Questions' markdown table (columns: #, Question, Status, Resolution, Deep-Dive Section) written back into `{comprehension_artifact}` — resolved questions cross-referenced to the section that answered them, newly discovered questions added as 'Open', plus a 'Remaining follow-up items (out of scope)' list. This is the authoritative unresolved-question set that drives the comprehension-sufficiency checkpoint (`has_open_questions`).

## Protocol

### 1. Question Management

- The 'Open Questions' section is a markdown table with columns: #, Question, Status, Resolution, Deep-Dive Section
- After each deep-dive iteration, mark resolved questions as 'Resolved' with a one-line summary and cross-reference to the deep-dive section that answered them
- Add new questions discovered during investigation with status 'Open' — questions naturally emerge from tracing data flows, examining edge cases, and reading adjacent code
- Below the table, maintain a 'Remaining follow-up items (out of scope)' list for questions identified but explicitly out of scope for the current work package
