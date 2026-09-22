---
metadata:
  version: 1.0.0
---

## Capability

State what the scope-discipline-check run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_scope_findings

Affected flows falling outside the intended scope, each with the changed symbol that reaches it.

### negative_scope_findings

Affected flows falling outside the intended scope, each with the changed symbol that reaches it — empty by construction, since an empty change set reaches no flow.

## Outputs

### scope_discipline_check_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-scope-discipline-check-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_scope_findings}`, the negative against `{negative_scope_findings}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` as the graph addressed.
   > An empty `{negative_scope_findings}` is an empty change set reaching no flow, since nothing is staged; the row names that fallback, which is distinct from `{positive_scope_findings}`, whose entries are flows outside an empty intended scope.

### 2. Write the Report

- Write `{scope_discipline_check_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
