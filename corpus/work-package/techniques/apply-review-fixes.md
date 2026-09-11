---
metadata:
  version: 1.1.0
---

## Capability

User-selected code-review findings and/or test improvements implemented and committed as one atomic step.

## Inputs

### classified_findings

The classified findings, each carrying its severity and its delivery tier — the set this fix cycle selects the code-review and test-suite entries from.

### code_findings_actionable

Whether code-review findings are in scope for this cycle.

### test_findings_actionable

Whether test improvements are in scope for this cycle.

## Protocol

### 1. Select Fixes

- From `{classified_findings}`, gather the code-review findings selected for fixing when `{code_findings_actionable}` is true, and the test-suite findings selected when `{test_findings_actionable}` is true.

### 2. Implement Fixes

- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: the symbol the finding names, direction: `upstream`) before editing a symbol
  > Where the report reads HIGH or CRITICAL, record that level and the symbols it names alongside the fix.
- Implement each selected finding in `{target_path}`, following existing code patterns and conventions.
- Apply test improvements alongside the code fixes when `{test_findings_actionable}` is true.
- Verify locally — confirm the changes compile and the affected tests pass before committing.

### 3. Commit Changes

- Apply [manage-git](./manage-git/TECHNIQUE.md)::[commit-paths](./manage-git/commit-paths.md) with `{target_path}`, `{branch_name}`, the fixed source paths, and a Conventional Commits message for the fix cycle, recording the `{commit_sha}` it returns against the findings this cycle addressed. This is the technique's final phase; no separate source commit step follows.

## Rules

### fix-only-selected

Implement only the findings selected for this cycle — do not scope-creep into adjacent changes or auto-fix Nit/Informational findings.
