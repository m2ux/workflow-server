---
metadata:
  version: 1.1.0
---

## Capability

Report a red contract-test suite written from the Contract alone.

## Outputs

### contract_tests_fail_on_base

True — the suite fails against the base tree.

### contract_tests_path

Stub path `contract-tests-worktree`.

### contract_tests_branch

Stub branch `feat/0-contract-tests`.

## Protocol

### 1. Surface

- Set `{contract_tests_fail_on_base}` true
- Set `{contract_tests_path}` to `contract-tests-worktree`
- Set `{contract_tests_branch}` to `feat/0-contract-tests`
