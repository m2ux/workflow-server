---
metadata:
  version: 1.0.0
---

## Capability

State what the change-risk-assessment run landed under its positive, negative and empty-diff bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer exercises to cover it.

### negative_change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer exercises to cover it.

### empty_diff_change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer exercises to cover it.

## Outputs

### change_risk_assessment_case_report

Three rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative and empty-diff cases each took.

#### artifact

`gitnexus-change-risk-assessment-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases under the graph `{repo_name}` names — the positive against `{positive_change_risk_verdict}`, the negative against `{negative_change_risk_verdict}`, and a third row named `empty-diff-case` against `{empty_diff_change_risk_verdict}` — per [Template](/conformance/resources/case-report.md#template).
   > A `{negative_change_risk_verdict}` whose impact half resolved no symbol rests on the diff's rating alone and says its caller set is hand-derived; the row names that fallback rather than reading the symbol as measured and unreached.
   > The `empty-diff-case` row's mark is an `{empty_diff_change_risk_verdict}` whose impact half measured a resolving symbol while its diff half landed no changed symbol, so the verdict rests on the symbol's rating alone and states that the diff rating is absent; the row names that fallback rather than reading the change as measured and found to touch nothing.

### 2. Write the Report

- Write `{change_risk_assessment_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
