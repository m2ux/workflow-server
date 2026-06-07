---
metadata:
  version: 1.0.0
---

## Capability

Verify the diff stays within the work-package's intended scope; flag scope creep where changes touch processes outside the requirements. (review-strategy, respond-to-pr-review)

## Inputs

### requirements_scope

the processes / functional areas the work package is meant to touch

## Output

### scope_findings

affected processes that fall outside `requirements-scope` (scope-creep candidates)

## Protocol

1. Apply [detect-changes](../../../meta/techniques/gitnexus-operations/detect-changes.md) to obtain the affected execution flows. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Compare the affected flows against `{requirements_scope}`.
3. Collect any affected flow outside `{requirements_scope}` into `{scope_findings}` as scope-creep candidates for user decision.
