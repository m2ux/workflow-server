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
- `{path_rationale}` records how much of the [design framework](../../resources/design-framework.md#design-framework-trizics-approach) the complexity warrants — at `simple`, problem definition, conventional solutions and synthesis; at `moderate`, problem classification as well; at `complex`, inventive solutions too
- Emit `{path_rationale}`
- Emit `{needs_comprehension}` as `true`
