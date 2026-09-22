---
metadata:
  version: 1.0.0
---

## Capability

State what the sequence-diagram-source run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_diagram_source

The ordered step trace of each execution flow the change runs through, which the sequence diagram is drawn from.

### negative_diagram_source

The ordered step trace of each execution flow the change runs through — empty by construction, since an empty change set reaches no flow.

## Outputs

### sequence_diagram_source_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-sequence-diagram-source-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_diagram_source}`, the negative against `{negative_diagram_source}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` as the graph addressed.
   > An empty `{negative_diagram_source}` is an empty change set reaching no flow, since nothing is staged, so the flow cycle ran no iteration; the row names that fallback rather than reading the change as one whose flows carry no steps.

### 2. Write the Report

- Write `{sequence_diagram_source_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
