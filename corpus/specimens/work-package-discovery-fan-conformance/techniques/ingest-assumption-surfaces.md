---
metadata:
  version: 1.0.0
---

## Capability

Append the assumption surfaces the discovery branches reported into the assumptions log in one write.

## Inputs

### research_assumptions

*(optional)* Assumptions the research branch surfaced.

### analysis_assumptions

*(optional)* Assumptions the implementation-analysis branch surfaced.

### assumptions_log

*(optional)* The assumptions log already on disk, when an earlier activity started one.

## Outputs

### assumptions_log

The assumptions [log](/work-package/resources/assumptions-review.md#assumptions-log-template) with every discovery surface appended — the one write of that file for the discovery fan.

#### artifact

`assumptions-log.md`

#### audience

`human`

## Protocol

### 1. Open the Log

- Open `{assumptions_log}` when it is present; otherwise start a fresh log per the [log template](/work-package/resources/assumptions-review.md#assumptions-log-template)

### 2. Append Each Surface

- Append every entry of `{research_assumptions}` and every entry of `{analysis_assumptions}` as one table row each — ID, phase, category, risk, statement with rationale — per the log template
  > Where a surface is absent or empty, append nothing for it.

### 3. Emit

- Emit the updated `{assumptions_log}`
