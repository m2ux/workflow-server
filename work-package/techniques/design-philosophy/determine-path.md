---
metadata:
  version: 1.1.0
---

## Capability

The rationale behind the selected workflow path, and the comprehension pass every path carries.

## Inputs

### problem_complexity

The assessed complexity (simple, moderate, or complex), against which the selected path is judged proportionate.

## Outputs

### needs_comprehension

Whether codebase comprehension is outstanding — `true` on every path, since comprehension precedes planning.

### path_rationale

The documented rationale for the selected workflow path (full, elicitation-only, research-only, or skip-optional), including how proportionate it is to `{problem_complexity}`.

## Protocol

### 1. Record the Path Rationale

- Judge the selected path against `{problem_complexity}`: simple, clearly-scoped problems warrant the lighter paths; moderate and complex problems warrant the full path. Where the selection and the complexity diverge, `{path_rationale}` records the divergence rather than resolving it.
- `{problem_complexity}` also scopes how much of the [design framework](../../resources/design-framework.md#design-framework-trizics-approach) plan-prepare later applies — simple: problem definition, conventional solutions, synthesis; moderate: add problem classification; complex: include inventive solutions. A lightweight application is proportionate for a simple change.
- Emit `{path_rationale}`
- Emit `{needs_comprehension}` as `true`
