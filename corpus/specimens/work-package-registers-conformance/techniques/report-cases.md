---
metadata:
  version: 1.0.1
---

## Capability

State what the deferred-items collection landed under its negative and positive bindings.

## Inputs

### negative_open_items

The unraised entries collected where no register exists — empty by construction.

### positive_open_items

The unraised entries collected from the register — the second deferral alone.

## Outputs

### register_case_report

Two rows for the one collection, shaped by the case report's [Template](/conformance/resources/case-report.md#template).

#### artifact

`work-package-registers-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the negative against `{negative_open_items}`, the positive against `{positive_open_items}` — per [Template](/conformance/resources/case-report.md#template); `Run:` names the collect technique, and the run addresses no graph, which the header says in the line a graph name takes.
   > An empty `{negative_open_items}` is the collection reading a missing register as nothing outstanding; the row names that fallback rather than reading it as a filtered register.

### 2. Write the Report

- Write `{register_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
