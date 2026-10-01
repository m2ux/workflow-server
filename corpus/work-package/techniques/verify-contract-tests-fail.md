---
metadata:
  version: 1.1.0
---

## Capability

Confirm the contract tests written for the current task fail against the base tree.

## Inputs

### contract_tests_path

Worktree holding the contract tests.

### contract_tests_changed_paths

Paths this task wrote.

### default_branch

*(optional)* Base branch name; unbound when the create-worktree step has not emitted it — then resolve from the worktree's upstream HEAD.

## Outputs

### contract_tests_fail_on_base

True when the suite for this task fails against the base tree; false when it passes or cannot run.

## Protocol

### 1. Run Against Base

- In `{contract_tests_path}`, ensure HEAD carries only the contract-test files on top of the default branch (no implementation)
- Run the project's test command scoped to `{contract_tests_changed_paths}`
- Set `{contract_tests_fail_on_base}` true when the run fails for reasons the Contract names (missing symbols, unmet behaviours); false when every assertion passes
