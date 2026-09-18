---
metadata:
  version: 1.0.0
---

## Capability

Narrow a whole-graph set of unreferenced symbols to the ones this work introduced or touched.

## Inputs

### result_rows

Symbols the graph holds no incoming reference to, each with the file it sits in.

### changed_files

the set of files changed by the work package

## Outputs

### orphan_candidates

Symbols in `{changed_files}` that nothing references — over-engineering and dead-code candidates for user decision.

## Protocol

1. Keep the rows of `{result_rows}` whose file appears in `{changed_files}`, and record them as `{orphan_candidates}`.
   > A whole-graph orphan set carries every entry point, every export a consumer outside the tree calls, and every symbol a macro body reaches — so the intersection is the candidate list and never the verdict.
2. Report each candidate with the file and the reason nothing reaches it, so the decision is whether the symbol earns its place rather than whether the graph found a caller.
