---
metadata:
  version: 1.3.0
---

## Capability

Confirm the contract tests written for the current task fail against the base tree.

## Inputs

### contract_tests_path

Worktree holding the contract tests.

### contract_tests_changed_paths

Paths this task wrote.

### default_branch

*(optional)* Base branch name.

## Outputs

### contract_tests_fail_on_base

True when the suite for this task fails against the base tree; false when it passes or cannot run.

## Protocol

### 1. Run Against Base

- In `{contract_tests_path}`, ensure HEAD carries only the contract-test files on top of `{default_branch}`
- Run the project's test command scoped to `{contract_tests_changed_paths}`
- Emit `{contract_tests_fail_on_base}`
