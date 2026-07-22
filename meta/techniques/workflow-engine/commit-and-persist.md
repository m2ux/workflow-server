---
metadata:
  version: 1.4.0
---

## Capability

Post-activity Progress mark plus commit/push of source-side changes and engineering artifacts.

## Inputs

### activity_id

Activity that just completed.

### planning_folder_path

Path to the planning folder.

### target_path

Path to the target submodule where source-side changes live (typically the application repo).

### mark_progress_na

*(optional)* Flag from the workflow bag: true means the completing activity should be marked path-skip / cancel / N/A rather than complete.

## Protocol

1. **README Progress:** Resolve the Progress moment from [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites): if `{mark_progress_na}` is true, use path-skip / cancel / mark N/A; otherwise use `activity_complete`. Apply [sync-progress-status](./sync-progress-status.md) with `activity_id={activity_id}`, `planning_folder_path={planning_folder_path}`, and that moment's `{target_status}` / overwrite defaults ([Status transition policy](../../resources/planning-readme.md#status-transition-policy)). Do not restate [Status vocabulary](../../resources/planning-readme.md#status-vocabulary). When `{mark_progress_na}` was true, set it false after the Apply.
2. Set the header-line `**Status:**` to the current lifecycle milestone for that workflow (text — distinct from Progress Status; see [Progress table](../../resources/planning-readme.md#progress-table)).
3. If the README already matches after steps 1–2, leave content equivalent — still include the file in the engineering commit below so a prior local-only edit is pushed.
4. If `{target_path}` has uncommitted changes (`git status --porcelain` non-empty), apply [version-control](../version-control/TECHNIQUE.md)::[commit-submodule](../version-control/commit-submodule.md) with `paths=changed files`, `submodule_message='<type>(<workflow-id>): <activity-id> source changes'` (pick the Conventional Commits type that fits the activity — feat for implement, fix for post-impl-review fixes, refactor for cleanup, etc.), and `parent_branch=current parent branch`. Skip when the working tree is clean.
5. **Engineering commit + push:** Apply [version-control](../version-control/TECHNIQUE.md)::[commit-regular-files](../version-control/commit-regular-files.md) for ALL changes under `.engineering/artifacts/` within `{planning_folder_path}` (including `README.md`, `session.json`, and `.session-token`) with message `docs(<workflow-id>): <activity-id> artifacts`. This post-activity hook **is** the commit request — do not wait for a separate user confirmation. Push must succeed before this operation returns.
6. Confirm the engineering push landed (remote tracking branch includes the new commit). If push failed, retry once; if still failing, surface the error and do not advance to the next activity.

## Rules

### commit-after-activity

After every completed activity, BOTH source-side changes (under `{target_path}`, via [commit-submodule](../version-control/commit-submodule.md)) AND engineering artifacts (under `.engineering/artifacts/`, via [commit-regular-files](../version-control/commit-regular-files.md)) MUST be committed and **pushed** before evaluating transitions to the next activity. Skipping either scope leaves a dirty or remote-stale tree that breaks resume, Engineering links, and downstream activities. The submodule commit may be skipped only when `{target_path}`'s working tree is clean. The engineering commit may be skipped only when the planning folder has no local changes **and** README Progress Status for `{activity_id}` already shows the intended post-activity status on the remote (complete, or cancelled/N/A when `{mark_progress_na}` applied) per [Status vocabulary](../../resources/planning-readme.md#status-vocabulary) — otherwise Apply sync-progress-status (step 1) then commit and push.

### readme-progress-before-persist

Planning-folder `README.md` Progress Status updates for the completed activity go through [sync-progress-status](./sync-progress-status.md) inside this hook — not a per-activity YAML step, not a client-workflow activity rule, and not a worker `finalize-activity` duty. This operation Applies that technique (complete or cancelled/N/A per `{mark_progress_na}`), updates the header lifecycle Status, and includes `README.md` in the pushed engineering commit.

### session-files-ride-along

`session.json` and `.session-token` are written by the server on every authenticated tool call and so are always present in the planning folder by the time this operation runs. Stage them in the SAME engineering commit as the activity's other artifacts — do not produce a separate `state` commit.

### no-stale-remote

A local-only README or artifact update does not satisfy this operation. Engineering links and resume assume the remote has the commit; push is mandatory whenever step 5 stages changes.
