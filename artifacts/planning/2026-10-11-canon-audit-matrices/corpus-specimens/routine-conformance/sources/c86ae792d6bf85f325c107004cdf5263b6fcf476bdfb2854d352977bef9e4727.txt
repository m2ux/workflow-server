---
metadata:
  version: 1.1.0
---

## Capability

State what each gitnexus technique this walk bound landed in the bag, under each of the two graphs the walk addressed, and which of the answers came from a graph layer that was there to read.

## Inputs

### repo_name

Name of the graph indexed with its program-dependence layers, which every measured answer came from.

### absent_layer_graph

Name of the graph built without its program-dependence layers, which the noted answers came from.

### trace_report

The shortest path from one symbol to the other, or where the search stopped short of one.

### cycle_report

The import cycles the graph holds, counted at the grain a fix acts on.

### taint_report

The taint findings matched, how many there are in full, and whether the graph holds the layer they come from.

### dependence_report

The control-dependence edges matched for the anchored function, how many there are in full, and whether the graph holds the layer they come from.

### absent_layer_taint_report

The taint findings matched, how many there are in full, and the note stating the graph holds no layer to record them.

### absent_layer_dependence_report

The control-dependence edges matched for the anchored function, how many there are in full, and the note stating the graph holds no layer to record them.

## Outputs

### layer_conformance_report

One row per bound technique per graph: whether its answer landed, what it holds, and for the layer-reading techniques whether the graph held the layer they read.

#### artifact

`gitnexus-layer-conformance-report.md`

#### audience

`human`

## Protocol

### 1. Fill the Table

- Fill the table from the six answers — over `{repo_name}`, `trace` against `{trace_report}`, `check` against `{cycle_report}`, `explain` against `{taint_report}` and `pdg-query` against `{dependence_report}`; over `{absent_layer_graph}`, `explain` against `{absent_layer_taint_report}` and `pdg-query` against `{absent_layer_dependence_report}` — per [Template](../resources/conformance-report.md#template), with both graph names in the header and each row naming the graph it answers from.
   > - A `{trace_report}` whose `status` is not `ok` still landed; its `Holds` column names the status and, on `no_path`, the furthest node reached.
   > - A `{taint_report}` or `{dependence_report}` whose `note` states the graph holds no taint or dependence layer came from a graph without it; its `Layer` column reads *absent* and its `Holds` column reads *unmeasured*. A taint answer's note also carries the layer's modelling caveats where the layer is present, so the row reads the note's statement and not its presence.
   > - `{absent_layer_taint_report}` and `{absent_layer_dependence_report}` each carry a note stating the graph holds no taint or dependence layer, so each of their rows reads *absent* under `Layer` and *unmeasured* under `Holds`. That pair is what the walk lands to show the shape an absent layer leaves, and a row reading *none found* there reports the code where the answer reports the graph.

### 2. Write the Report

- Write `{layer_conformance_report}` to `{planning_folder_path}`, with [Rules](../resources/conformance-report.md#rules) governing what each row may claim.
