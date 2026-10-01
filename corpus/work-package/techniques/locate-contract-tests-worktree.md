---
metadata:
  version: 1.0.0
---

## Capability

Derive the contract-tests worktree path and branch from the feature worktree naming.

## Inputs

### branch_name

The feature branch implement uses.

### target_path

The feature worktree path implement uses.

### planning_folder_path

The session planning folder whose basename aligns the worktree slug.

## Outputs

### contract_tests_branch

`{branch_name}-contract-tests` — a sibling branch cut for contract-test files alone.

### contract_tests_path

`<checkout>/.worktrees/<slug>-contract-tests/` beside `{target_path}`.

## Protocol

### 1. Name the Branch

- Set `{contract_tests_branch}` to `{branch_name}-contract-tests`

### 2. Locate the Worktree

- Take the parent of `{target_path}` as the `.worktrees/` directory
- Set `{contract_tests_path}` to that parent plus the basename of `{planning_folder_path}` with `-contract-tests` appended and a trailing slash
