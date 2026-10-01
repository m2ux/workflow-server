---
metadata:
  version: 1.0.0
---

## Capability

Stage and commit selected paths on the contract-tests worktree branch.

## Inputs

### paths

Array of repository-relative paths to stage and commit.

### commit_message

Commit subject for the contract-test files.

### contract_tests_path

Worktree the commit runs in.

### contract_tests_branch

Branch that worktree must stand on.

## Outputs

### commit_sha

SHA of the new commit, or empty when there was nothing to commit.

## Protocol

### 1. Branch guard

- From `{contract_tests_path}`, confirm the current branch is `{contract_tests_branch}`. On mismatch, STOP.

### 2. Stage and commit

- `git -C {contract_tests_path} add -- {paths}`
- When the staged diff is empty, set `{commit_sha}` empty and return
- Commit with `{commit_message}`, honouring manage-git `code-commit-coauthor-trailer`
- Capture `{commit_sha}`
