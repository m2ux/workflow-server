---
metadata:
  version: 1.0.0
---

## Capability

Read what the reach run settled for each member of the group and write the one document the run leaves behind — every row naming its graph and its instrument.

## Inputs

### group_reach_report

One entry per member: the graph, the reach, the instrument, the evidence, and whether the group ranking surfaced the member.

### boundary_symbols

The names the probes searched each member for, each with its kind.

### group_query_report

Execution flows drawn from the group's members for the concern, each carrying the member it came from.

### group_freshness_report

Per member, how far its graph is behind its code and whether it has one at all.

### contract_registry_stats

What the rebuilt contract registry holds — the contracts extracted per member, and how many cross-link.

### home_impact_report

What depends on the concern within its home graph.

### home_repo

The graph name of the member the concern was raised in.

### concern_symbol

The symbol the concern was raised against.

## Outputs

### conformance_report

What the run settled, shaped by [Template](../resources/conformance-report.md#template).

#### artifact

`gitnexus-radius-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Name the Concern and Its Home

- Open the report with `{concern_symbol}`, `{home_repo}`, the risk level and direct-dependent count `{home_impact_report}` carries — the radius every other row is measured against — and the contract and cross-link counts `{contract_registry_stats}` reports for the group.

### 2. Write One Row Per Member

- Take `{group_reach_report}` in its order and write one row per member: the graph, the reach, the instrument, whether `{group_query_report}` surfaced it, and the freshness `{group_freshness_report}` reports for it. `conformance-report.every-row-names-its-graph` and `conformance-report.an-empty-graph-answer-carries-its-instrument` govern what a row may omit.

### 3. Name the Boundary and the Search

- List `{boundary_symbols}` by kind, saying which kinds came back empty from the home tree, and name the member the graph held no edge for and the search answered instead. `conformance-report.the-searched-member-is-the-finding` governs what that paragraph says.

### 4. Write the Report

- Write `{conformance_report}` to `{planning_folder_path}` following [Template](../resources/conformance-report.md#template), with the [Rules](../resources/conformance-report.md#rules) governing what each section may claim.
