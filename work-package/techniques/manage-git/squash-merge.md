---
metadata:
  version: 1.0.0
---

## Capability

Perform a local signed squash merge into the default branch — used when the GitHub web UI squash flow cannot produce a GPG-signed merge commit.

## Inputs

### default_branch

Default branch name (typically `main`)

### type

Commit type prefix (feat / fix / chore / docs / etc.)

### commit_description

One-line description for the merge commit message

### target_path

Path to the edit-side checkout the merge runs in (per the manage-git group's directory-scope rule, edit-side git operations run inside `{target_path}`).

### branch_name

The feature branch whose commits are squashed onto `{default_branch}`.

### pr_number

The pull-request number, interpolated into the merge commit subject (`(#{pr_number})`).

## Outputs

### squash_merge_commit

A single signed, sign-off-trailered squash commit (`{type}: {commit_description} (#{pr_number})`) landed on `{default_branch}` and pushed to `origin`. A side-effect op; the merged default-branch history is its product.

## Protocol

1. From `{target_path}`, check out and update the default branch: `git checkout {default_branch} && git pull`.
2. Squash all branch commits onto the default branch: `git merge --squash {branch_name}`.
3. Commit with Signed-off-by and GPG signature: `git commit -s -S -m "{type}: {commit_description} (#{pr_number})"`.
4. Push the merge commit: `git push`.
