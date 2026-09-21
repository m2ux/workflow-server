---
metadata:
  version: 1.0.0
---

## Capability

State what each diff-reading run this walk referred to landed in the bag.

## Inputs

### coverage_gaps

Changed symbols no test file calls.

### update_candidates

Changed symbols a test file calls against a signature or behaviour the change moved.

### scope_findings

Affected flows falling outside the intended scope, each with the changed symbol that reaches it.

### orphan_candidates

Symbols in the changed files that nothing references.

### public_api_symbols

The exported symbols present in the diff, each with the file and kind the graph records.

### change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer exercises to cover it.

## Outputs

### diff_conformance_report

One row per referred run: whether it materialised, what it landed, and the body shape reaching that row evidences.

#### artifact

`gitnexus-diff-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the five runs — `diff-coverage-map` against `{coverage_gaps}` and `{update_candidates}`, `scope-discipline-check` against `{scope_findings}`, `orphan-scan` against `{orphan_candidates}`, `public-api-enum` against `{public_api_symbols}`, and `change-risk-assessment` against `{change_risk_verdict}` — per [Template](../resources/conformance-report.md#template).

### 2. Write the Report

- Write `{diff_conformance_report}` to `{planning_folder_path}`, with [Rules](../resources/conformance-report.md#rules) governing what each row may claim.
