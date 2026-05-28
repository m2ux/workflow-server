# diagram-source-select

Source architecture-diagram structure from graph resources rather than hand-rolled module surveys, scope-bounded to the affected processes. (summarize-architecture)

## Inputs

- **diagram_type** — `'package'` or `'sequence'`
- **name** — repo name

## Output

- **diagram_source** — for `'package'`: functional-area clusters and their members; for `'sequence'`: step-by-step process traces — bounded to processes affected by the work package

## Procedure

1. Apply [detect-changes](detect-changes.md) to bound the diagram to affected processes.
2. For `'package'`: read `gitnexus://repo/{name}/clusters` (functional areas with cohesion scores) and `gitnexus://repo/{name}/cluster/{name}` (members).
3. For `'sequence'`: read `gitnexus://repo/{name}/process/{name}` (execution traces) for the affected processes.

## Errors

### stale_index

**Cause:** the index is out of date

**Recovery:** run `npx gitnexus analyze`, then retry
