---
metadata:
  version: 1.0.1
---

## Capability

Resolve the engineering checkout's publish branch and the planning-folder files that ride on it, for artifact hyperlink construction.

## Inputs

### host_repo_path

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

### modified_paths

The tracked paths carrying modifications in the engineering checkout, already read by the run.

## Outputs

### artifact_publish_ref

The engineering checkout's branch name — the ref engineering-artifact hyperlinks resolve against.

### publishable_files

Every changed file under `{planning_folder_path}`, including `README.md`, the linked report artifacts, `review-summary.md`, `session.json` and `.session-token`.

## Protocol

### 1. Resolve the Checkout and Branch

- Resolve `{$eng_git_dir}` from `{host_repo_path}` as the engineering checkout `manage-git.directory-scope` names. Resolve `{$eng_branch}`: `git -C {eng_git_dir} branch --show-current` — never hardcode `main`.

### 2. Collect the Publishable Files

- Keep every path in `{modified_paths}` that sits under `{planning_folder_path}`, and hold that set as `{publishable_files}`. Emit `{eng_branch}` as `{artifact_publish_ref}`.

## Rules

### publish-ref-is-a-branch

The emitted ref is the branch, never a commit SHA. The planning folder keeps growing after a review is posted — close-out, retrospective, session trace and follow-ups all arrive later — so a reader following a branch link sees the current tree while a reader following a sha link sees the tree as it stood before those files existed. Re-resolving on a later activity refreshes the branch tip without changing any link already posted.
