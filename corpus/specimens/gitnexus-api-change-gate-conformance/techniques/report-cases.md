---
metadata:
  version: 1.0.0
---

## Capability

State what the api-change-gate run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole.

### positive_api_change_approved

Whether the measured consumer surface was accepted at the gate. True where the measurement named no mismatch, the rating being low enough that no gate was presented.

### negative_api_impact_report

The route's consumers, the response keys each reads, the middleware wrapping the handler, the execution flows it opens, and a risk level over the whole.

### negative_api_change_approved

Whether the measured consumer surface was accepted at the gate. True where the measurement named no mismatch, the rating being low enough that no gate was presented.

## Outputs

### api_change_gate_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-api-change-gate-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases under the graph `{repo_name}` names — the positive against `{positive_api_impact_report}` and `{positive_api_change_approved}`, the negative against `{negative_api_impact_report}` and `{negative_api_change_approved}` — per [Template](/conformance/resources/case-report.md#template).
   > A `{negative_api_impact_report}` naming a route the graph does not hold — an error, or an empty consumer set — carries no mismatch, so the gate was not presented and `{negative_api_change_approved}` is the seeded value; the row names that fallback rather than reading the route as consistent with its consumers.

### 2. Write the Report

- Write `{api_change_gate_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
