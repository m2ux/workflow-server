---
metadata:
  version: 1.1.0
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

List with this case appended.

## Protocol

### 1. Record

- Append `{contract_tests_fail_on_base}`, `{contract_tests_path}`, `{contract_tests_branch}` to `{case_outcomes}`
