---
metadata:
  version: 1.0.0
---

## Capability

Disposition every graded finding against the accepted-issue threshold and write the findings register — the adjudicated record that separates what can move the verdict from what is observation or dismissed, with the full trail preserved.

## Inputs

### graded_findings

Every candidate with its complete grade tuple and grading rationale.

## Outputs

### findings_register

The adjudicated register: a disposition table (finding, area, tuple summary, disposition) followed by per-finding detail — full tuple, rationale, and anchors.

#### artifact

`findings-register.md`

### accepted_findings

The accepted subset in area order — the only findings the verdict computation reads.

## Protocol

### 1. Disposition

- Apply the accepted-issue threshold from the [grading-rubric](../../resources/grading-rubric.md) to each entry in `{graded_findings}`: medium or high evidence confidence with a verified anchor is accepted; below threshold is an observation; evidence-contradicted candidates are dismissed with the contradicting anchor recorded.
- Record a disposition rationale for every non-accepted candidate — the register preserves the full adjudication trail, not just the accepted slice.

### 2. Write Register

- Write `{findings_register}` to the planning folder and emit `{accepted_findings}`.
- Confirm every register entry carries its complete grade tuple before finishing — this is what the grade-tuple completeness gate checks.
