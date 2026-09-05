---
metadata:
  version: 1.1.0
---

## Capability

Verify the diff stays within the work-package's intended scope; flag scope creep where changes touch processes outside the requirements.

## Inputs

### repo_name

Optional. Name of the indexed graph to address. Omit only where exactly one graph is indexed.

### requirements_scope

the processes / functional areas the work package is meant to touch

## Outputs

### scope_findings

affected processes that fall outside `requirements-scope` (scope-creep candidates)

## Protocol

1. Apply [detect-changes](./detect-changes.md) against `{repo_name}` to obtain the affected execution flows. If the index is out of date, run `npx gitnexus analyze`, then retry.
2. Compare the affected flows against `{requirements_scope}`.
3. Collect any affected flow outside `{requirements_scope}` into `{scope_findings}` as scope-creep candidates for user decision.
