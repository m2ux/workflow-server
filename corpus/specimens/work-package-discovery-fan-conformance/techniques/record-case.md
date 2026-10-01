---
metadata:
  version: 1.0.0
---

## Capability

The outcome list with the case just walked appended.

## Inputs

### needs_research

Whether research was needed for the case.

### research_assumptions

Assumptions the research branch surfaced.

### analysis_assumptions

Assumptions the implementation-analysis branch surfaced.

### assumptions_log

The log after the join's one ingest write.

### case_outcomes

One outcome per case taken so far.

## Outputs

### case_outcomes

The list with this case's outcome appended.

## Protocol

### 1. Record Outcome

- Append one entry to `{case_outcomes}`: `{needs_research}`, the lengths of `{research_assumptions}` and `{analysis_assumptions}`, and whether `{assumptions_log}` is present after ingest
