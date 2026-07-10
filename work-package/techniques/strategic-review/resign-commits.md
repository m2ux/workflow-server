---
metadata:
  version: 1.1.0
---

## Capability

Rebase the feature branch onto its merge base and re-sign every commit so each carries a valid GPG signature, then verify no unsigned commit remains.

## Inputs

### push_remote

The git remote a force-with-lease push targets when one is required after the history rewrite.

`default: origin`

## Outputs

### unsigned_commits_in_pr

Boolean — set to `false` once every commit in the branch range carries a valid GPG signature.

### resign_unsigned_commits_requested

Boolean — set to `false` once the re-sign pass has completed.

### review_findings

Findings produced by the scope and artifact review; a re-sign failure is appended as an additional finding.

## Protocol

### 1. Re-sign Commits

- Determine the merge base `{$merge_base}` of `{branch_name}` against the base branch.
- Inside `{target_path}`, rebase onto `{merge_base}` and re-sign each commit, e.g. `` `git rebase --exec 'git commit --amend --no-edit -S' {merge_base}` `` (or an equivalent interactive rebase), so every commit in the `{merge_base}..HEAD` range ends with a good GPG signature.
- Confirm no unsigned commit remains with `` `git log --format='%h %G?' {merge_base}..HEAD` `` — none may report `N` or `B`.
- When a push is required, use `` `git push --force-with-lease` `` to `{push_remote}`.  
  > If any commit fails to re-sign, leave `{unsigned_commits_in_pr}` `true` and record the failure in `{review_findings}`.
- On success, set `{unsigned_commits_in_pr}` and `{resign_unsigned_commits_requested}` to `false`.
