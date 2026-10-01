---
metadata:
  version: 1.0.0
---

## Capability

Run the merged contract tests against the implementation in the feature worktree.

## Inputs


### contract_tests_merged_paths

Paths the merge step wrote.

## Outputs

### contract_tests_passed

True when every merged contract suite passes against the implementation.

### contract_test_failures

Per-failure detail when any assertion fails — empty when `{contract_tests_passed}` is true.

## Protocol

### 1. Run

- In `{target_path}`, run the project's test command scoped to `{contract_tests_merged_paths}`
- Set `{contract_tests_passed}` true when every assertion holds; false otherwise
- When false, set `{contract_test_failures}` to the failing assertions and the Contract fields they name

### 2. Record

- A green suite means the implementation satisfies the Contract the tests were written from
- A red suite means either the implementation is incomplete or the Contract (and its tests) are ambiguous
