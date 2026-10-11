---
metadata:
  version: 1.1.0
---

## Capability

Separate the taint findings a change introduced from the ones it inherited, so a review judges the flows the diff opened and reads the rest as context.

## Inputs

### change_report

changed symbols, changed files, affected execution flows, risk level

### taint_reports

One taint report per changed symbol: the findings anchored at it, how many there are in full, and whether the graph holds the layer they come from.

## Outputs

### introduced_flows

Findings whose source, sink or a hop between them lands on a symbol the change moved — the flows the diff opened or widened, each with the changed symbol it lands on.

### inherited_flows

Findings anchored at a changed symbol whose every hop sits outside what the change moved — flows present before the change, carried as context.

### taint_unmeasured

Whether any report in `{taint_reports}` carried a note stating the graph holds no taint layer, so the partition rests on a graph without that layer and settles nothing.

## Protocol

### 1. Settle Whether the Layer Was There

- Read each entry of `{taint_reports}` for a note stating the graph holds no taint layer, and set `{taint_unmeasured}` true where any carries one; both partitions below are then empty by construction rather than by measurement.
   > Every report over a tree outside the languages the source and sink models cover — Java, TypeScript, JavaScript and Python — carries that note.

### 2. Partition by Where the Hops Land

- For each finding across `{taint_reports}`, hold its source, its sink and each hop between them against the symbols and files `{change_report}` names as moved.
- Take every finding with a hop on a moved symbol into `{introduced_flows}`, naming that symbol, and every other into `{inherited_flows}`.
   > A sanitiser or guard the change removed shows as a finding whose hops sit on unchanged code while the diff sits between them; hold the sink's guarding predicates against the diff before filing such a finding as inherited.
