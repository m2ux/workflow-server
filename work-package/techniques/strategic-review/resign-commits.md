---
metadata:
  version: 1.1.0
---

## Capability

Feature-branch commits re-signed so every commit carries a valid GPG signature.

## Inputs

### push_remote

The git remote a force-with-lease push targets when one is required after the history rewrite.

## Outputs

### unsigned_commits_in_pr

Whether any commit in the branch range still lacks a valid GPG signature.

### resign_unsigned_commits_requested

Whether a re-sign pass is still owed on the branch range.

### review_findings

The scope and artifact review's findings, carrying a re-sign failure among them where the pass left one.


## Protocol

### 1. Re-sign Commits

- Determine the merge base `{$merge_base}` of `{branch_name}` against the base branch.
- Inside `{target_path}`, rebase onto `{merge_base}` and re-sign each commit, e.g. `` `git rebase --exec 'git commit --amend --no-edit -S' {merge_base}` `` (or an equivalent interactive rebase), so every commit in the `{merge_base}..HEAD` range ends with a good GPG signature.
- Confirm no unsigned commit remains with `` `git log --format='%h %G?' {merge_base}..HEAD` `` — none may report `N` or `B`.
- When a push is required, use `` `git push --force-with-lease` `` to `{push_remote}`.  
  > If any commit fails to re-sign, leave `{unsigned_commits_in_pr}` `true` and record the failure in `{review_findings}`.
- On success, set `{unsigned_commits_in_pr}` and `{resign_unsigned_commits_requested}` to `false`.
