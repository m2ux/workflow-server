---
metadata:
  version: 1.0.0
---

## Capability

State what the taint run this walk referred to landed in the bag, and whether the graph layer it read was there to measure.

## Inputs

### introduced_flows

Findings with a hop on a symbol the change moved, each naming that symbol.

### inherited_flows

Findings anchored at a changed symbol whose every hop sits outside the change.

### taint_unmeasured

Whether the graph carried no taint layer, so the partition settles nothing.

## Outputs

### taint_conformance_report

One row for the referred run: whether it materialised, what it landed, whether the layer it read was present, and the body shape reaching that row evidences.

#### artifact

`gitnexus-taint-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the run — `diff-taint-pass` against `{introduced_flows}`, `{inherited_flows}` and `{taint_unmeasured}` — per [Template](../resources/conformance-report.md#template).
   > Where `{taint_unmeasured}` is true the two lists are empty by construction; the row's `Layer` column carries that, and its `Holds` column reads *unmeasured* rather than *empty*.

### 2. Write the Report

- Write `{taint_conformance_report}` to `{planning_folder_path}`, with [Rules](../resources/conformance-report.md#rules) governing what the row may claim.
