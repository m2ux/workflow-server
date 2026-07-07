---
metadata:
  version: 1.0.0
---

## Capability

Implement the code-review findings and/or test improvements selected by the user, then commit the resulting changes. The commit is this technique's final phase — the fixes and their commit form one atomic step, so no separate commit step is needed.

## Inputs

### review_findings

The review findings to fix — the code-review findings (when `{needs_code_fixes}`) and/or the test-suite findings (when `{needs_test_improvements}`) the user selected for this fix cycle.

### needs_code_fixes

Whether code-review findings are in scope for this cycle.

### needs_test_improvements

Whether test improvements are in scope for this cycle.

### target_path

Path to the target repository where the code changes are applied and committed.

### branch_name

The feature branch the fixes are committed to.

## Outputs

### applied_fixes

The committed fix changes: the selected `{review_findings}` implemented in `{target_path}` (code-review findings when `{needs_code_fixes}`, test improvements when `{needs_test_improvements}`), verified to compile with affected tests passing, then staged and committed on `{branch_name}` via [manage-git](./manage-git/TECHNIQUE.md)::[artifact-commits](./manage-git/artifact-commits.md). The commit is the technique's final phase, so the effect is one or more fix commits on the feature branch — no separate commit step follows.

## Protocol

### 1. Select Fixes

- From `{review_findings}`, gather the code-review findings selected for fixing when `{needs_code_fixes}` is true, and the test-suite findings selected when `{needs_test_improvements}` is true.
- Confirm the selected set with the user when the selection is not already explicit.

### 2. Implement Fixes

- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: `{$target_symbol}`, direction: `upstream`) before editing a symbol; surface HIGH or CRITICAL risk to the user before proceeding.
- Implement each selected finding in `{target_path}`, following existing code patterns and conventions.
- Apply test improvements alongside the code fixes when `{needs_test_improvements}` is true.
- Verify locally — confirm the changes compile and the affected tests pass before committing.

### 3. Commit Changes

- Apply [manage-git](./manage-git/TECHNIQUE.md)::[artifact-commits](./manage-git/artifact-commits.md) to stage and commit the fix changes on `{branch_name}`. This is the technique's final phase; no separate commit step follows.

## Rules

### fix-only-selected

Implement only the findings selected for this cycle — do not scope-creep into adjacent changes or auto-fix Nit/Informational findings.

### commit-is-final-phase

The commit phase is part of this technique. Fixes and their commit are one atomic operation; callers do not append a separate commit step.
