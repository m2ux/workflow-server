---
metadata:
  version: 1.2.0
---

## Capability

Append the bound assumption surfaces into the assumptions log.

## Inputs

### research_assumptions

*(optional)* Assumptions surfaced from research.

### analysis_assumptions

*(optional)* Assumptions surfaced from analysis of the current implementation.

### assumptions_log

*(optional)* The assumptions log already on disk.

## Outputs

### assumptions_log

The assumptions [log](../resources/assumptions-review.md#assumptions-log-template) with every bound surface appended.

#### artifact

`assumptions-log.md`

#### audience

`human`

## Protocol

### 1. Open the Log

- Open `{assumptions_log}` when it is present; otherwise start a fresh log per the [log template](../resources/assumptions-review.md#assumptions-log-template)

### 2. Append Each Surface

- Append every entry of `{research_assumptions}` and every entry of `{analysis_assumptions}` as one table row each — ID, phase, category, risk, statement with rationale — per the log template
  > Where a surface is absent or empty, append nothing for it.

### 3. Emit

- Emit the updated `{assumptions_log}`
