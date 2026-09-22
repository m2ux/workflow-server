---
metadata:
  version: 1.1.0
---

## Capability

State what the package-diagram-source run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_diff_scope

A comparison, so the positive case's change set names files and flows for the selection to work from.

### base_ref

The commit the positive case's comparison measured against.

### positive_diagram_source

The functional areas the change reaches, each with its members, which the package diagram is drawn from.

### negative_diff_scope

The index alone, where nothing is staged, so the negative case's change set is empty.

### negative_diagram_source

The functional areas an empty change reaches, each with its members — empty by construction.

## Outputs

### package_diagram_source_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-package-diagram-source-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_diff_scope}` with `{base_ref}` against `{positive_diagram_source}`, the negative binding `{negative_diff_scope}` against `{negative_diagram_source}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > The positive row's inputs column carries `{base_ref}` beside `{positive_diff_scope}`, so a reader sees which commit the comparison that produced its areas measured against.
   > An empty `{negative_diagram_source}` is an empty change set selecting no area, so the member walk had nothing to iterate; the row names that fallback rather than reading it as areas the run reached and found bare.

### 2. Write the Report

- Write `{package_diagram_source_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
