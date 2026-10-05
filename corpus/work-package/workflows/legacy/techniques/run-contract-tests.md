---
metadata:
  version: 1.1.0
---

## Capability

Run the merged contract tests against the implementation in the feature worktree.

## Inputs


### contract_tests_merged_paths

Repository-relative paths of the contract tests to run.

## Outputs

### contract_tests_passed

True when every merged contract suite passes against the implementation.

### contract_test_failures

Failing assertions and the Contract fields they name. Empty when `{contract_tests_passed}` is true.

## Protocol

### 1. Run

- In `{target_path}`, run the project's test command scoped to `{contract_tests_merged_paths}`
- Emit `{contract_tests_passed}` and `{contract_test_failures}`
