---
metadata:
  version: 1.0.0
---

## Capability

State what the diff-coverage-map run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_coverage_gaps

Changed symbols no test file calls.

### positive_update_candidates

Changed symbols a test file calls against a signature or behaviour the change moved.

### negative_coverage_gaps

Changed symbols no test file calls.

### negative_update_candidates

Changed symbols a test file calls against a signature or behaviour the change moved.

## Outputs

### diff_coverage_map_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-diff-coverage-map-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases under the graph `{repo_name}` names — the positive against `{positive_coverage_gaps}` and `{positive_update_candidates}`, the negative against `{negative_coverage_gaps}` and `{negative_update_candidates}` — per [Template](/conformance/resources/case-report.md#template).
   > An empty `{negative_coverage_gaps}` beside an empty `{negative_update_candidates}` is an empty change set — nothing staged, so the per-symbol pass ran zero times; the row names that fallback rather than reading the change as classified and covered.

### 2. Write the Report

- Write `{diff_coverage_map_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
