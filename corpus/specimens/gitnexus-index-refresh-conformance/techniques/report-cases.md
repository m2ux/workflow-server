---
metadata:
  version: 1.0.0
---

## Capability

State what the index-refresh run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_stats

File, symbol and process counts the graph holds.

### positive_index_stale

Whether the graph is behind the tree it was built from.

### negative_stats

File, symbol and process counts the graph holds.

### negative_index_stale

Whether the graph is behind the tree it was built from.

## Outputs

### index_refresh_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-index-refresh-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_stats}` and `{positive_index_stale}`, the negative against `{negative_stats}` and `{negative_index_stale}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > The negative case's mark is a true staleness flag on the first read, a rebuild, then the second read's verdict; `{negative_index_stale}` holds that verdict, and the row names the rebuild that preceded it rather than reading the flag as a graph that was current from the start.

### 2. Write the Report

- Write `{index_refresh_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
