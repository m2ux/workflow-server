---
metadata:
  version: 1.2.1
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### needs_research

Whether research was needed for the case.

### research_assumptions

Assumptions surfaced from research.

### analysis_assumptions

Assumptions surfaced from analysis of the current implementation.

### assumptions_log

The assumptions log after the surfaced assumptions were appended.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended: whether research was needed, how many assumptions each surface holds, and whether the assumptions log is present.

## Protocol

### 1. Record Outcome

- Append this case to `{case_outcomes}` from `{needs_research}`, `{research_assumptions}`, `{analysis_assumptions}`, and `{assumptions_log}`
