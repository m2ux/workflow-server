---
metadata:
  version: 1.0.0
---

## Capability

State what the change-risk-assessment run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer exercises to cover it.

### negative_change_risk_verdict

One rating for the change, the counts it rests on, and the flows a reviewer exercises to cover it.

## Outputs

### change_risk_assessment_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-change-risk-assessment-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases under the graph `{repo_name}` names — the positive against `{positive_change_risk_verdict}`, the negative against `{negative_change_risk_verdict}` — per [Template](/conformance/resources/case-report.md#template).
   > A `{negative_change_risk_verdict}` whose impact half resolved no symbol rests on the diff's rating alone and says its caller set is hand-derived; the row names that fallback rather than reading the symbol as measured and unreached.

### 2. Write the Report

- Write `{change_risk_assessment_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
