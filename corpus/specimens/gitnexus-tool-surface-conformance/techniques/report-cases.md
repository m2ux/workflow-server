---
metadata:
  version: 1.0.0
---

## Capability

State what the tool-surface run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_tool_inventory

Each declared tool with the file handling it and the description it registers.

### negative_tool_inventory

Each declared tool with the file handling it and the description it registers — empty by construction, with the run's note reading the emptiness as registrations the walk did not recognise.

## Outputs

### tool_surface_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-tool-surface-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive against `{positive_tool_inventory}`, the negative against `{negative_tool_inventory}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` as the graph addressed.
   > An empty `{negative_tool_inventory}` is the run's fallback for a markdown tree, and the run's own note reads it as registrations the walk did not recognise; the row names that mark rather than reading the tree as one defining no tools.

### 2. Write the Report

- Write `{tool_surface_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
