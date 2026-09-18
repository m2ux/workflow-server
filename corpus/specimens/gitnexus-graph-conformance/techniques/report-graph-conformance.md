---
metadata:
  version: 1.0.0
---

## Capability

State what each graph-reading run this walk referred to landed, and which graph answered.

## Inputs

### repo_name

The graph every answer in the area run came from.

### stats

Symbol, relationship and process counts the index refresh read.

### index_stats

The same counts as the refresh nested inside the area run read them.

### index_stale

Whether the graph is behind the tree it was built from.

### group_freshness_report

Per member, how far its graph is behind its code and whether it has one at all.

### contract_registry_stats

What the rebuilt contract registry holds.

### query_report

The execution flows the area's concept lands in.

### symbol_contexts

Per named symbol, its callers, callees and flow membership.

### flow_traces

The ordered step trace of each flow the area's concept ranked into.

### context_report

The restructured symbol's callers, callees and flow membership.

### impact_report

What depends on the restructured symbol.

### symptom_query_report

The execution flows the symptom's text ranked into.

### suspect_context_report

The suspect symbol's callers, callees and flow membership.

### suspect_flow_traces

The ordered step trace of each flow the suspect participates in.

### call_chains

Every chain of calls reaching the suspect within two hops.

### package_diagram_source

The functional areas the change reaches, each with its members.

### sequence_diagram_source

The ordered step trace of each flow the change runs through.

## Outputs

### graph_conformance_report

One row per referred run: what it landed, and the graph it answered from.

#### artifact

`gitnexus-graph-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Name The Graph

- Open the report with `{repo_name}` — every answer below came from that graph, and one naming no graph is an answer about a tree the reader has to guess at.

### 2. State What Each Run Landed

- Record the refreshes against `{stats}`, `{index_stale}`, `{group_freshness_report}` and `{contract_registry_stats}`; the area run against `{index_stats}`, `{query_report}`, `{symbol_contexts}` and `{flow_traces}`; the restructuring against `{context_report}` and `{impact_report}`; the symptom against `{symptom_query_report}`, `{suspect_context_report}`, `{suspect_flow_traces}` and `{call_chains}`; and the two diagram sources against `{package_diagram_source}` and `{sequence_diagram_source}`.
- State an empty value as empty and an absent one as absent, because a run that measured nothing and a run that never materialised reach this activity looking alike.

### 3. Hold The Two Refreshes Against Each Other

- Compare `{stats}` with `{index_stats}`: the first is what the activity's own refresh read, the second what the refresh nested inside the area run read. They answer about one graph, so a disagreement is the nesting landing a value where the outer reference did not expect it.
- Write `{graph_conformance_report}` to `{planning_folder_path}` per [Template](../resources/conformance-report.md#template), with [Rules](../resources/conformance-report.md#rules) governing what each row may claim.
