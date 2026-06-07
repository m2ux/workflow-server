---
metadata:
  version: 1.0.0
---

## Capability

Post-activity hook: commit source-side changes and engineering artifacts.

## Inputs

### activity_id

Activity that just completed.

### planning_folder_path

Path to the planning folder.

### target_path

Path to the target submodule where source-side changes live (typically the application repo).

## Protocol

1. If `{target_path}` has uncommitted changes (`git status --porcelain` non-empty), apply [version-control](../version-control/TECHNIQUE.md)::[commit-submodule](../version-control/commit-submodule.md) with `paths=changed files`, `submodule_message='<type>(<workflow-id>): <activity-id> source changes'` (pick the Conventional Commits type that fits the activity — feat for implement, fix for post-impl-review fixes, refactor for cleanup, etc.), and `parent_branch=current parent branch`. Skip when the working tree is clean.
2. Apply [version-control](../version-control/TECHNIQUE.md)::[commit-regular-files](../version-control/commit-regular-files.md) for ALL changes under `.engineering/artifacts/` within `{planning_folder_path}` (including `session.json` and `.session-token`, which the server has already written via its atomic persist on every authenticated tool call) with message `docs(<workflow-id>): <activity-id> artifacts`.

## Rules

### commit-after-activity

After every completed activity, BOTH source-side changes (under `{target_path}`, via [commit-submodule](../version-control/commit-submodule.md)) AND engineering artifacts (under `.engineering/artifacts/`, via [commit-regular-files](../version-control/commit-regular-files.md)) MUST be committed and pushed before evaluating transitions to the next activity. Skipping either scope leaves a dirty working tree that breaks resume and downstream activities (validate, strategic-review, submit-for-review). The submodule commit may be skipped only when `{target_path}`'s working tree is clean.

### session-files-ride-along

`session.json` and `.session-token` are written by the server on every authenticated tool call and so are always present in the planning folder by the time this operation runs. Stage them in the SAME engineering commit as the activity's other artifacts — do not produce a separate `state` commit.
