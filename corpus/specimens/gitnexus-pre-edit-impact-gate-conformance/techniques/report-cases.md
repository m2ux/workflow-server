---
metadata:
  version: 1.0.0
---

## Capability

State what the pre-edit-impact-gate run landed under its positive and negative bindings.

## Inputs

### repo_name

Name of the indexed graph the run addressed.

### positive_target

A symbol with many callers, whose rating brings the positive case to the gate.

### positive_impact_report

What depends on the symbol, at depth 1/2/3, with the execution flows reached and a risk level.

### positive_edit_approved

Whether the measured blast radius was accepted at the gate. True where the rating was low enough that no gate was presented.

### negative_target

A name the graph does not resolve, so the negative case's rating is withheld.

### negative_impact_report

What depends on the symbol, at depth 1/2/3, with the execution flows reached and a risk level — withheld for a name the graph does not resolve.

### negative_edit_approved

Whether the measured blast radius was accepted at the gate. True where the rating was low enough that no gate was presented.

## Outputs

### pre_edit_impact_gate_case_report

Two rows for the one run: the bindings each case took, whether each materialised, what each landed, and which fallback the negative case took.

#### artifact

`gitnexus-pre-edit-impact-gate-cases.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the two cases — the positive binding `{positive_target}` against `{positive_impact_report}` and `{positive_edit_approved}`, the negative binding `{negative_target}` against `{negative_impact_report}` and `{negative_edit_approved}` — per [Template](/conformance/resources/case-report.md#template), with `{repo_name}` in the header.
   > The negative case's mark is a withheld rating with its note in `{negative_impact_report}` and a false `{negative_edit_approved}` from the hold; the row names that refusal rather than reading the false as a measured blast radius someone declined.

### 2. Write the Report

- Write `{pre_edit_impact_gate_case_report}` to `{planning_folder_path}`, with [Rules](/conformance/resources/case-report.md#rules) governing what each row may claim.
