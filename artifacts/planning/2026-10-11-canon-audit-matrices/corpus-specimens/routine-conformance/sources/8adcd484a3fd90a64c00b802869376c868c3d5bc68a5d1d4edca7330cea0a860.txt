---
metadata:
  version: 1.2.0
---

## Capability

State what the area-comprehension run landed under its positive, negative and stale-graph bindings.

## Inputs

### current_graph_name

Name of the graph current with its tree, which the positive and negative cases addressed.

### stale_graph_fixture_path

Path of the throwaway checkout the stale-graph case prepared, which the run walked and the row names as the tree its answers describe.

### stale_graph_name

Name the prepared checkout's graph is keyed under, which the stale-graph case addressed.

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

### stale_graph_index_stats

File, symbol and process counts the graph holds.

### stale_graph_index_stale

Whether the graph is still behind the tree after the rebuild, which is the age every answer below carries.

### stale_graph_query_report

The execution flows the area's concept lands in, the symbols those flows run, and the definitions reached outside any flow.

### stale_graph_symbol_contexts

Per named symbol, its callers, callees and flow membership.

### stale_graph_flow_traces

The ordered step trace of each execution flow the area's concept ranked into.

## Outputs

### area_comprehension_case_report

Three rows for the one run: the graph and bindings each case took, whether each materialised, what each landed, which fallback the negative case took and which recovery the stale-graph case took.

#### artifact

`gitnexus-area-comprehension-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases — the positive against `{positive_index_stats}`, `{positive_index_stale}`, `{positive_query_report}`, `{positive_symbol_contexts}` and `{positive_flow_traces}`, the negative against `{negative_index_stats}`, `{negative_index_stale}`, `{negative_query_report}`, `{negative_symbol_contexts}` and `{negative_flow_traces}`, and a third row named `stale-graph-case` against `{stale_graph_index_stats}`, `{stale_graph_index_stale}`, `{stale_graph_query_report}`, `{stale_graph_symbol_contexts}` and `{stale_graph_flow_traces}` — per [Template](/conformance/resources/case-report.md#template), with `{current_graph_name}` and `{stale_graph_name}` both named in the header and each row naming in its `Graph` column the one its answers came from.
   > The positive and negative rows name `{current_graph_name}` there, and the `stale-graph-case` row names `{stale_graph_name}`, so a reader sees which graph each row's answers came from.
   > A `{negative_query_report}` with no process and no process symbol is a concept no flow ranks into, its definitions filling or not; both per-item passes ran zero times, so `{negative_symbol_contexts}` and `{negative_flow_traces}` are empty by construction, and the row names that fallback rather than reading the area as read and found unconnected.
   > The `stale-graph-case` row's mark is a true staleness flag on the nested refresh's first read, a rebuild, then the second read's verdict; `{stale_graph_index_stale}` holds that verdict, and `{stale_graph_query_report}`, `{stale_graph_symbol_contexts}` and `{stale_graph_flow_traces}` were taken from the graph as rebuilt, so the row names the rebuild that preceded them rather than reading the flag as a graph that was current from the start.
   > The `stale-graph-case` row's `Inputs` column carries `{stale_graph_fixture_path}`, the checkout the case prepared for this walk. The tree is throwaway and the reader has no standing name to look it up by, so the path is what says which tree that row's answers describe.

### 2. Write the Report

- Write `{area_comprehension_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
