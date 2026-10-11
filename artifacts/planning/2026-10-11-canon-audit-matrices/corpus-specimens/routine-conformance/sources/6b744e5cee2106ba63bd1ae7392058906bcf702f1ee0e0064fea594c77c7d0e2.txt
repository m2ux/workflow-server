---
metadata:
  version: 1.0.0
---

## Capability

State what the restructure-surface run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_context_report

The symbol's callers, callees and flow membership — the callees an extraction carries with it, and the calls a split divides.

### positive_impact_report

What depends on the symbol, at depth 1/2/3, with the execution flows reached and a risk level — the callers a restructuring updates.

### negative_context_report

The symbol's callers, callees and flow membership — resolving nothing for a symbol no graph holds.

### negative_impact_report

What depends on the symbol, at depth 1/2/3, with the execution flows reached and a risk level — withholding its rating for a symbol no graph holds.

## Outputs

### restructure_surface_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-restructure-surface-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_context_report}` and `{positive_impact_report}`, the negative against `{negative_context_report}` and `{negative_impact_report}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` as the graph addressed.
   > A `{negative_context_report}` resolving nothing and a `{negative_impact_report}` withholding its rating are the run's fallback for a symbol outside the graph: both reports place the symbol outside the graph and the run's own notes send the reader to grep. The row names that mark rather than reading the symbol as one nothing reaches.

### 2. Write the Report

- Write `{restructure_surface_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
