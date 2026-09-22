---
metadata:
  version: 1.0.0
---

## Capability

State what the symptom-trace run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_query_report

The execution flows the symptom's text ranked into, the symbols those flows run, and the definitions reached outside any flow.

### positive_context_report

The suspect's callers, callees and flow membership.

### positive_suspect_flow_traces

The ordered step trace of each execution flow the suspect participates in.

### positive_call_chains

Every chain of calls reaching the suspect within two hops, each with the caller it starts at and how many hops it takes.

### negative_query_report

The execution flows the symptom's text ranked into, the symbols those flows run, and the definitions reached outside any flow — ranking into no flow for text nothing matches.

### negative_context_report

The suspect's callers, callees and flow membership — resolving nothing for a symbol no graph holds.

### negative_suspect_flow_traces

The ordered step trace of each execution flow the suspect participates in — empty by construction, since a suspect the graph does not hold participates in none.

### negative_call_chains

Every chain of calls reaching the suspect within two hops — empty by construction, since no call reaches a symbol outside the graph.

## Outputs

### symptom_trace_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-symptom-trace-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_query_report}`, `{positive_context_report}`, `{positive_suspect_flow_traces}` and `{positive_call_chains}`, the negative against `{negative_query_report}`, `{negative_context_report}`, `{negative_suspect_flow_traces}` and `{negative_call_chains}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` as the graph addressed.
   > A `{negative_query_report}` ranking into no flow, a `{negative_context_report}` resolving nothing, zero entries in `{negative_suspect_flow_traces}` and empty `{negative_call_chains}` from the raw query are the run's fallback for a symptom outside the graph; the row names that mark rather than reading the suspect as one the graph holds and nothing calls.

### 2. Write the Report

- Write `{symptom_trace_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
