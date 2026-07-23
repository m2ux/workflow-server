---
metadata:
  version: 1.0.0
---

## Capability

Commit and push review-linked planning artifacts to the parent-repo ref the consolidated review links, emitting the publish ref for hyperlink construction.

## Inputs

### planning_folder_path

Path to the planning folder whose artifacts the consolidated review links (`README.md`, report artifacts, `review-summary.md`).

### reference_path

Path to the parent repo containing `.engineering/` — used to resolve the push branch and capture the publish ref.

## Outputs

### artifact_publish_ref

The git ref embedded in engineering-artifact hyperlinks — the commit SHA of the push (preferred) or the current parent branch when the SHA cannot be read.


## Protocol

1. Resolve the current parent branch: `git -C {reference_path} branch --show-current`.
2. Apply [version-control::commit-regular-files](../../meta/techniques/version-control/commit-regular-files.md) for ALL changed files under `{planning_folder_path}` (including `README.md`, linked report artifacts, `review-summary.md`, `session.json`, and `.session-token`) with message `docs(work-package): submit-for-review review artifacts` and `branch` = current parent branch.
3. Capture the new commit SHA: `git -C {reference_path} rev-parse HEAD`. Emit it as `{artifact_publish_ref}`. When the SHA cannot be read, emit the current parent branch name instead.

## Rules

### publish-before-post

Runs only after `review-summary-approval` selects a post option (`review_posted == true`) and before `update-pr::post-review-comment`. The in-activity publish satisfies link resolution at post time; the post-activity [commit-and-persist](../../meta/techniques/workflow-engine/commit-and-persist.md) hook covers README Progress, session files, and any remaining dirty state without delaying this step.
