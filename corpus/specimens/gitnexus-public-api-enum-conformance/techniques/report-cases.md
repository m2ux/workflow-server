---
metadata:
  version: 1.0.0
---

## Capability

State what the public-api-enum run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_diff_scope

The whole diff, so the positive case's filter is composed over a populated changed-symbol set.

### positive_public_api_symbols

The exported symbols present in the diff, each with the file and kind the graph records.

### negative_diff_scope

The index alone, where nothing is staged, so the negative case's changed-symbol set is empty.

### negative_public_api_symbols

The exported symbols present in an empty diff, each with the file and kind the graph records — empty by construction.

## Outputs

### public_api_enum_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-public-api-enum-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_diff_scope}` against `{positive_public_api_symbols}`, the negative binding `{negative_diff_scope}` against `{negative_public_api_symbols}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > An empty `{negative_public_api_symbols}` is an empty change set, over which the visibility filter names no symbol; the row names that fallback rather than reading it as changed symbols none of which is exported.

### 2. Write the Report

- Write `{public_api_enum_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
