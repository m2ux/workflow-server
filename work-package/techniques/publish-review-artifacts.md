---
metadata:
  version: 1.1.0
---

## Capability

Commit and push review-linked planning artifacts to the engineering-checkout ref the consolidated review links, emitting the publish ref for hyperlink construction.

## Inputs

### planning_folder_path

Path to the planning folder whose artifacts the consolidated review links (`README.md`, report artifacts, `review-summary.md`).

### repo_root

Path to the product repo root (monorepo or standalone); the `.engineering/` artifacts directory sits under it.

## Outputs

### artifact_publish_ref

The git ref engineering-artifact hyperlinks resolve against — the publish commit SHA, or the engineering checkout's current branch name.


## Protocol

1. Resolve `{$eng_git_dir}`: `{repo_root}/.engineering` when that path is a git checkout (submodule or nested clone); otherwise `{repo_root}`. Resolve `{$eng_branch}`: `git -C {eng_git_dir} branch --show-current` — never hardcode `main`.
2. Apply [version-control::commit-regular-files](../../meta/techniques/version-control/commit-regular-files.md) for ALL changed files under `{planning_folder_path}` (including `README.md`, linked report artifacts, `review-summary.md`, `session.json`, and `.session-token`) with message `docs(work-package): submit-for-review review artifacts` and `branch` = `{eng_branch}`.
3. Capture the new commit SHA: `git -C {eng_git_dir} rev-parse HEAD`. Emit it as `{artifact_publish_ref}`. When the SHA cannot be read, emit `{eng_branch}` instead.

## Rules

### publish-before-post

Runs only after `review-summary-approval` selects a post option (`review_posted == true`) and before `update-pr::post-review-comment`. The in-activity publish satisfies link resolution at post time; the post-activity [commit-and-persist](../../meta/techniques/workflow-engine/commit-and-persist.md) hook covers README Progress, session files, and any remaining dirty state without delaying this step.
