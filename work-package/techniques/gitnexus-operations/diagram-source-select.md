---
metadata:
  version: 1.0.0
---

## Capability

Source architecture-diagram structure from graph resources rather than hand-rolled module surveys, scope-bounded to the affected processes. (summarize-architecture)

## Inputs

### diagram_type

`'package'` or `'sequence'`

### name

repo name

## Output

### diagram_source

for `'package'`: functional-area clusters and their members; for `'sequence'`: step-by-step process traces — bounded to processes affected by the work package

## Protocol

1. Apply [detect-changes](../../../meta/techniques/gitnexus-operations/detect-changes.md) to bound the diagram to affected processes. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Branch on `{diagram_type}`. For `'package'`: read `gitnexus://repo/{name}/clusters` (functional areas with cohesion scores) and `gitnexus://repo/{name}/cluster/{name}` (members) as the `{diagram_source}`.
3. For `'sequence'`: read `gitnexus://repo/{name}/process/{name}` (execution traces) for the affected processes as the `{diagram_source}`.
