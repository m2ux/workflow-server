---
metadata:
  version: 1.0.0
---

## Capability

Map the current git diff to the changed-symbol set and the execution flows it affects. The canonical pre-commit and diff-driven-review entry point.

## Inputs

### diff_scope

`'staged'`, `'unstaged'`, or `'all'` (default `'all'`)

## Outputs

### change_report

changed symbols, changed files, affected execution flows, risk level

## Protocol

1. Call `gitnexus_detect_changes {diff_scope}` to produce the `{change_report}` (changed symbols, changed files, affected flows, risk level). If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Pre-commit: confirm the changes affect only the expected symbols and flows.
3. Diff-driven review: use the changed-symbol set as the basis for coverage, scope, and severity work (see the composite operations below).
