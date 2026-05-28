# scope-discipline-check

Verify the diff stays within the work-package's intended scope; flag scope creep where changes touch processes outside the requirements. (review-strategy, respond-to-pr-review)

## Inputs

- **requirements_scope** — the processes / functional areas the work package is meant to touch

## Output

- **scope_findings** — affected processes that fall outside requirements_scope (scope-creep candidates)

## Procedure

1. Apply [detect-changes](detect-changes.md) to obtain the affected execution flows.
2. Compare the affected flows against requirements_scope.
3. Flag any affected flow outside requirements_scope as scope creep for user decision.

## Errors

### stale_index

**Cause:** the index is out of date

**Recovery:** run `npx gitnexus analyze`, then retry
