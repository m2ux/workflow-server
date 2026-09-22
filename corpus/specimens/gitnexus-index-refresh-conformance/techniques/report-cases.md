---
metadata:
  version: 1.0.0
---

## Capability

State what the index-refresh run landed under its positive, negative and unindexed-tree bindings.

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

### unindexed_tree_stats

File, symbol and process counts the graph holds.

### unindexed_tree_index_stale

Whether the graph is behind the tree it was built from.

## Outputs

### index_refresh_case_report

Three rows for the one run: the bindings each case took, whether each materialised, what each landed, which fallback the negative case took, and which mark the unindexed-tree case landed.

#### artifact

`gitnexus-index-refresh-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases — the positive against `{positive_stats}` and `{positive_index_stale}`, the negative against `{negative_stats}` and `{negative_index_stale}`, and a third row named `unindexed-tree-case` against `{unindexed_tree_stats}` and `{unindexed_tree_index_stale}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > The negative case's mark is a true staleness flag on the first read, a rebuild, then the second read's verdict; `{negative_index_stale}` holds that verdict, and the row names the rebuild that preceded it rather than reading the flag as a graph that was current from the start.
   > The unindexed-tree row's mark is an error naming the repository on the first read, which the run reads as no graph — the flag true and the stats empty — then a build that keys a new graph under the tree's basename, then a second read; `{unindexed_tree_stats}` holds the new graph's counts and `{unindexed_tree_index_stale}` is false. The row names the error and the build, so a graph built from nothing reads apart from the negative row's graph rebuilt from behind.

### 2. Write the Report

- Write `{index_refresh_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
