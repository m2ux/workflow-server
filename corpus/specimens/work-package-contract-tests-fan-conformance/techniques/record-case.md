---
metadata:
  version: 1.2.0
---

## Capability

Append this case's contract-test outcome.

## Inputs

### contract_tests_fail_on_base

Whether the suite failed against the base tree.

### contract_tests_path

Worktree path the contract tests were written to.

### contract_tests_branch

Branch the contract tests were written on.

### case_outcomes

Outcomes so far.

## Outputs

### case_outcomes

The list with this case appended: whether the suite failed against the base tree, the worktree path, and the branch.

## Protocol

### 1. Record

- Append this case to `{case_outcomes}`
