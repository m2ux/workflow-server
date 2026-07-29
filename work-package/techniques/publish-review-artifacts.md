---
metadata:
  version: 1.2.0
---

## Capability

Commit and push review-linked planning artifacts to the engineering-checkout ref the consolidated review links, emitting the publish ref for hyperlink construction.

## Inputs

### planning_folder_path

Path to the planning folder whose artifacts the consolidated review links (`README.md`, report artifacts, `review-summary.md`).

### host_repo_path

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

## Outputs

### artifact_publish_ref

The git ref engineering-artifact hyperlinks resolve against — the publish commit SHA, or the engineering checkout's current branch name.


## Protocol

1. Resolve `{$eng_git_dir}`: `{host_repo_path}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{host_repo_path}`. Resolve `{$eng_branch}`: `git -C {eng_git_dir} branch --show-current` — never hardcode `main`.
2. Apply [manage-git::artifact-commits](./manage-git/artifact-commits.md) for ALL changed files under `{planning_folder_path}` (including `README.md`, linked report artifacts, `review-summary.md`, `session.json`, and `.session-token`) with `branch` = `{eng_branch}`, `activity_name` = `submit-for-review`, and `issue_key` = `{issue_number}`. That op stages, commits and pushes inside the engineering checkout, so the ref step 3 emits addresses the commit that carries these artifacts.
3. Capture the new commit SHA: `git -C {eng_git_dir} rev-parse HEAD`. Emit it as `{artifact_publish_ref}`. When the SHA cannot be read, emit `{eng_branch}` instead.
