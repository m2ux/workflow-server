---
metadata:
  version: 1.1.0
---

## Capability

State what the api-change-gate run landed under its positive, negative and multi-verb bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole — one report, naming no consumer, for a route nothing in the tree fetches.

### positive_api_change_approved

Whether the measured consumer surface was accepted at the gate. True where the measurement named no mismatch, the rating being low enough that no gate was presented.

### negative_api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole.

### negative_api_change_approved

Whether the measured consumer surface was accepted at the gate. True where the measurement named no mismatch, the rating being low enough that no gate was presented.

### multi_verb_api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole — the set form, routes with a total, where one URL serves several verbs.

### multi_verb_api_change_approved

Whether the measured consumer surface was accepted at the gate. True where the measurement named no mismatch, the rating being low enough that no gate was presented.

## Outputs

### api_change_gate_case_report

Three rows for the one run: the bindings each case took, whether each materialised, what each landed, which fallback the negative case took, and which answer shape the multi-verb case landed.

#### artifact

`gitnexus-api-change-gate-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the three cases under the graph `{repo_name}` names — the positive against `{positive_api_impact_report}` and `{positive_api_change_approved}`, the negative against `{negative_api_impact_report}` and `{negative_api_change_approved}`, and a third row named `multi-verb-case` against `{multi_verb_api_impact_report}` and `{multi_verb_api_change_approved}` — per [Template](/conformance/resources/case-report.md#template).
   > `{positive_api_impact_report}` covers a route the graph holds that nothing fetches, so it names no consumer and no mismatch and `{positive_api_change_approved}` is the seeded value; the row names the report the route landed rather than a gate the measurement reached.
   > A `{negative_api_impact_report}` naming a route the graph does not hold — an error, or an empty consumer set — carries no mismatch, so the gate was not presented and `{negative_api_change_approved}` is the seeded value; the row names that fallback rather than reading the route as consistent with its consumers.
   > The multi-verb row's mark is the set shape: `{multi_verb_api_impact_report}` carries `routes` with a `total` of three, one per verb under the one URL, no mismatch across them, and `{multi_verb_api_change_approved}` is the seeded value because no gate was presented. The row names the shape and the count, so a seed kept over a consistent set reads apart from the negative row's seed kept over an absent route.

### 2. Write the Report

- Write `{api_change_gate_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
