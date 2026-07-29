---
metadata:
  version: 1.3.0
---

## Capability

Commit and push review-linked planning artifacts to the engineering-checkout ref the consolidated review links, emitting the publish ref for hyperlink construction.

## Inputs

### planning_folder_path

Path to the planning folder whose artifacts the consolidated review links (`README.md`, report artifacts, `review-summary.md`).

### host_repo_path

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

### publishing_activity

Name recorded on the publish commit, identifying which activity's artifacts it carries.

#### default

`submit-for-review`

## Outputs

### artifact_publish_ref

The engineering checkout's branch name — the ref engineering-artifact hyperlinks resolve against.


## Protocol

1. Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`. Resolve `{$eng_branch}`: `git -C {eng_git_dir} branch --show-current` — never hardcode `main`.
2. Apply [manage-git::artifact-commits](./manage-git/artifact-commits.md) for ALL changed files under `{planning_folder_path}` (including `README.md`, linked report artifacts, `review-summary.md`, `session.json`, and `.session-token`) with `branch` = `{eng_branch}`, `activity_name` = `{publishing_activity}`, and `issue_key` = `{issue_number}`. That op stages, commits and pushes inside the engineering checkout, so the branch tip carries these artifacts.
3. Emit `{eng_branch}` as `{artifact_publish_ref}`.

## Rules

### publish-ref-is-a-branch

The emitted ref is the branch, never a commit SHA. The planning folder keeps growing after a review is posted — close-out, retrospective, session trace and follow-ups all arrive later — so a reader following a branch link sees the current tree while a reader following a sha link sees the tree as it stood before those files existed. Re-running this op on a later activity refreshes the branch tip without changing any link already posted.
