---
metadata:
  version: 1.1.0
---

## Capability

Bring the contract-test files from the contract-tests worktree into the implement worktree so the join can run them against the implementation.

## Inputs

### contract_tests_path

Worktree that holds the contract-test commits.


### contract_tests_branch

Branch the contract-tests worktree stands on.

## Outputs

### contract_tests_merged_paths

Repository-relative paths copied into `{target_path}`.

## Protocol

### 1. List Contract-Test Paths

- From `{contract_tests_path}`, list the repository-relative paths the `{contract_tests_branch}` tip added over the merge-base with the default branch (contract-test files only)

### 2. Copy Into Implement Worktree

- For each path, copy the file content from `{contract_tests_path}` into the same path under `{target_path}`
- Do not overwrite an implement-branch file at the same path — contract tests live in files of their own; a collision is a definition defect to stop on
- Emit `{contract_tests_merged_paths}` as the paths written under `{target_path}`
