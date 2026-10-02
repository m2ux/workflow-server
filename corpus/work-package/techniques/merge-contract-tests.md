---
metadata:
  version: 1.2.0
---

## Capability

Bring the contract-test files from the contract-tests worktree into the feature worktree.

## Inputs

### contract_tests_path

Worktree that holds the contract-test commits.


### contract_tests_branch

Branch the contract-tests worktree stands on.

### default_branch

The repository's default branch, which the contract-test branch is compared with.

## Outputs

### contract_tests_merged_paths

Repository-relative paths copied into `{target_path}`.

## Protocol

### 1. List Contract-Test Paths

- From `{contract_tests_path}`, list the repository-relative paths the `{contract_tests_branch}` tip added over the merge-base with `{default_branch}` (contract-test files only)

### 2. Copy Into Implement Worktree

- For each path, copy the file content from `{contract_tests_path}` into the same path under `{target_path}`
- Copy a path only when that path is absent under `{target_path}`
  > A path already present is omitted from `{contract_tests_merged_paths}`
- Emit `{contract_tests_merged_paths}` as the paths written under `{target_path}`
