---
metadata:
  version: 1.0.0
---

## Capability

State what each gitnexus operation this walk bound landed in the bag, and which of the answers came from a graph layer that was there to read.

## Inputs

### trace_report

The shortest path from one symbol to the other, or where the search stopped short of one.

### cycle_report

The import cycles the graph holds, counted at the grain a fix acts on.

### taint_report

The taint findings matched, how many there are in full, and whether the graph holds the layer they come from.

### dependence_report

The control-dependence edges matched for the anchored function, how many there are in full, and whether the graph holds the layer they come from.

## Outputs

### layer_conformance_report

One row per bound operation: whether its answer landed, what it holds, and for the two layer-reading operations whether the layer was present.

#### artifact

`gitnexus-layer-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the four operations — `trace` against `{trace_report}`, `check` against `{cycle_report}`, `explain` against `{taint_report}` and `pdg-query` against `{dependence_report}` — per [Template](../resources/conformance-report.md#template).
   > - A `{trace_report}` whose `status` is not `ok` still landed; its `Holds` column names the status and, on `no_path`, the furthest node reached.
   > - A `{taint_report}` or `{dependence_report}` whose `note` states the graph holds no taint or dependence layer came from a graph without it; its `Layer` column reads *absent* and its `Holds` column reads *unmeasured*. A taint answer's note also carries the layer's modelling caveats where the layer is present, so the row reads the note's statement and not its presence.

### 2. Write the Report

- Write `{layer_conformance_report}` to `{planning_folder_path}`, with [Rules](../resources/conformance-report.md#rules) governing what each row may claim.
