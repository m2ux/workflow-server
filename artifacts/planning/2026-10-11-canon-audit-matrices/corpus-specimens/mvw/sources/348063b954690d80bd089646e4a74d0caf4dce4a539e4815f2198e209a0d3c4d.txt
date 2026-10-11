---
metadata:
  version: 1.2.0
---

## Capability

State what the graph-for-tree run landed under its positive and negative bindings.

## Inputs

### positive_repo_name

The graph the resolve named over a tree a graph already covers.

### negative_repo_name

The graph the run named after building one over a tree no graph covered.

### positive_tree_path

Filesystem path of a tree a graph covers, so the positive case names it at the first resolve.

### positive_index_stats

The symbol, relationship and process counts a build reports for the graph it wrote.

### negative_tree_path

Path of the throwaway checkout the negative case prepared, which carries source and no graph.

### negative_index_stats

The symbol, relationship and process counts a build reports for the graph it wrote.

## Outputs

### graph_for_tree_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-graph-for-tree-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_tree_path}` against `{positive_index_stats}`, named `{positive_repo_name}`, and the negative binding `{negative_tree_path}` against `{negative_index_stats}`, named `{negative_repo_name}` — per [Template](/conformance/resources/case-report.md#template).
   > The two cases address different graphs, so each row names its own rather than the header naming one for both.
   > `{negative_tree_path}` is the checkout the negative case prepared for this walk, so the path is what says which tree that row's counts describe.
   > A populated `{negative_index_stats}` is the mark of the fallback: the first resolve landed an empty name, the build wrote a graph over the tree, and the second resolve named it; the row names that sequence rather than reading the name as one the inventory held from the start.

### 2. Write the Report

- Write `{graph_for_tree_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
