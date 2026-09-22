---
metadata:
  version: 1.0.0
---

## Capability

State what the area-comprehension run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_index_stats

File, symbol and process counts the graph holds.

### positive_index_stale

Whether the graph is still behind the tree after the rebuild, which is the age every answer below carries.

### positive_query_report

The execution flows the area's concept lands in, the symbols those flows run, and the definitions reached outside any flow.

### positive_symbol_contexts

Per named symbol, its callers, callees and flow membership.

### positive_flow_traces

The ordered step trace of each execution flow the area's concept ranked into.

### negative_index_stats

File, symbol and process counts the graph holds.

### negative_index_stale

Whether the graph is still behind the tree after the rebuild, which is the age every answer below carries.

### negative_query_report

The execution flows the area's concept lands in, the symbols those flows run, and the definitions reached outside any flow.

### negative_symbol_contexts

Per named symbol, its callers, callees and flow membership.

### negative_flow_traces

The ordered step trace of each execution flow the area's concept ranked into.

## Outputs

### area_comprehension_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-area-comprehension-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases under the graph `{repo_name}` names — the positive against `{positive_index_stats}`, `{positive_index_stale}`, `{positive_query_report}`, `{positive_symbol_contexts}` and `{positive_flow_traces}`, the negative against `{negative_index_stats}`, `{negative_index_stale}`, `{negative_query_report}`, `{negative_symbol_contexts}` and `{negative_flow_traces}` — per [Template](/conformance/resources/case-report.md#template).
   > A `{negative_query_report}` with no process and no process symbol is a concept no flow ranks into, its definitions filling or not; both per-item passes ran zero times, so `{negative_symbol_contexts}` and `{negative_flow_traces}` are empty by construction, and the row names that fallback rather than reading the area as read and found unconnected.

### 2. Write the Report

- Write `{area_comprehension_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
