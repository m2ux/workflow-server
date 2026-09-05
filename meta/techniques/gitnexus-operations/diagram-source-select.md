---
metadata:
  version: 1.1.0
---

## Capability

Source architecture-diagram structure from graph resources rather than hand-rolled module surveys, scope-bounded to the affected processes.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### diagram_type

`'package'` or `'sequence'`

## Outputs

### diagram_source

for `'package'`: functional-area clusters and their members; for `'sequence'`: step-by-step process traces — bounded to processes affected by the work package

## Protocol

1. Apply [detect-changes](./detect-changes.md) against `{repo_name}` to bound the diagram to affected processes. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Branch on `{diagram_type}` for the `{diagram_source}`.
   > - For `'package'`: read `gitnexus://repo/{repo_name}/clusters` for the functional areas and their cohesion scores, then apply [read-cluster](./read-cluster.md) for the members of each area the affected processes touch.
   > - For `'sequence'`: apply [read-process](./read-process.md) for each affected process and take the execution traces it returns.
