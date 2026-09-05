---
metadata:
  version: 1.13.0
---

## Capability

Post-activity Progress mark plus commit/push of source-side changes and engineering artifacts.

## Inputs

### activity_id

Activity that just completed.

### mark_progress_na

*(optional)* True when the completing activity should be marked path-skip / cancel / N/A rather than complete.

## Protocol

1. **README Progress:** Resolve the Progress moment from [Progress Status call sites](../../../meta/resources/planning-readme.md#progress-status-call-sites): if `{mark_progress_na}` is true, use path-skip / cancel / mark N/A; otherwise use `activity_complete`. Apply [sync-progress-status](./sync-progress-status.md)(*activity_id*={activity_id}, *planning_folder_path*={planning_folder_path}, *target_status*=that moment's status, with its overwrite defaults per [Status transition policy](../../../meta/resources/planning-readme.md#status-transition-policy)); record `{rows_updated}` from that Apply. Do not restate [Status vocabulary](../../../meta/resources/planning-readme.md#status-vocabulary). When `{mark_progress_na}` was true, set it false after the Apply.  
   > Apply [distrust-then-reconcile](./dispatch-activity.md#distrust-then-reconcile) when `inspect_session` path/state for `{planning_folder_path}` or related critical variables disagrees with the just-completed worker's `activity_complete` envelope.
2. Set the header-line `**Status:**` to the current lifecycle milestone for that workflow (text — distinct from Progress Status; see [Progress table](../../../meta/resources/planning-readme.md#progress-table)).
3. If the README already matches after steps 1–2, leave content equivalent — still include the file in the engineering commit below so a prior local-only edit is pushed.
4. If `{host_repo_path}/{component_path}` has uncommitted changes (`git status --porcelain` non-empty), apply [version-control](../version-control/TECHNIQUE.md)::[commit-submodule](../version-control/commit-submodule.md)(*paths*=changed files, *submodule_message*=`'<type>(<workflow-id>): <activity-id> source changes'` with the Conventional Commits type that fits the activity — feat for implement, fix for post-impl-review fixes, refactor for cleanup, *parent_branch*=current parent branch). Skip when the working tree is clean.
5. **Engineering commit + push:** Commit ALL changes under `.engineering/artifacts/` within `{planning_folder_path}`, including `README.md`, `session.json` and `.session-token`, with *message*=`docs(<workflow-id>): <activity-id> artifacts`. The primitive follows the layout, classified by `version-control.infrastructure-submodule-paths`. This post-activity hook **is** the commit request — do not wait for a separate user confirmation. Push must succeed before this operation returns: Engineering links and resume assume the remote holds the commit, so a local-only README or artifact update does not satisfy this step.  
   > - When `.engineering` is a checkout of its own, apply [commit-submodule](../version-control/commit-submodule.md)(*submodule_path*=`.engineering`) — its own branch and remote carry the artifacts.
   > - Otherwise apply [commit-regular-files](../version-control/commit-regular-files.md) — the artifacts are ordinary files of the host checkout.
   > - Where the host branch accepts changes only through pull requests, the parent's submodule-pointer bump lands in a PR; a direct push to that branch is refused, and the engineering push above already satisfies this step without it.
6. Confirm the engineering push landed (remote tracking branch includes the new commit). If push failed, retry once; if still failing, surface the error and do not advance to the next activity.
7. Emit the run status in the shape [run-status-shape](./TECHNIQUE.md#run-status-shape) declares. This is the last phase, after the push is confirmed, so every link the emission publishes points at an artifact the remote already holds.

## Rules

### commit-after-activity

After every completed activity, BOTH source-side changes (under `{host_repo_path}/{component_path}`) AND engineering artifacts (under `.engineering/artifacts/`) MUST be committed and **pushed** before evaluating transitions to the next activity. Skipping either scope leaves a dirty or remote-stale tree that breaks resume, Engineering links, and downstream activities.

- Skip the engineering commit only where the planning folder has no local changes **and** README Progress Status for `{activity_id}` already shows its intended post-activity status on the remote — complete, or cancelled/N/A where `{mark_progress_na}` applied, per [Status vocabulary](../../../meta/resources/planning-readme.md#status-vocabulary).
- Scope: this orchestrator post-activity hook only. Ad-hoc commits outside it are [explicit-commit](../version-control/TECHNIQUE.md#explicit-commit); the meta workflow's own setup sequence has its own cadence, [setup-sequence-persists-once](#setup-sequence-persists-once).

### setup-sequence-persists-once

Across the meta workflow's setup activities — every activity up to and including the one that dispatches the client workflow — mark Progress per activity and commit once.

- Mark Progress and set the header lifecycle Status as each activity completes: both are local edits to a README someone watches while the ceremony runs.
- Hold the source-side commit and the engineering commit-and-push until the client workflow is dispatched, then make them once over everything those activities produced. That is the first moment anything outside this session reads the artifacts, since the client workflow's own commits land after it.
- A session interrupted mid-ceremony still resumes from server-side state rather than from the remote, so holding the commit does not put the resume at risk.
- Scope: the setup sequence only. Client-workflow activities persist per activity, per [commit-after-activity](#commit-after-activity).

### session-files-ride-along

`session.json` and `.session-token` are written by the server on every authenticated tool call and so are always present in the planning folder by the time this operation runs. Stage them in the SAME engineering commit as the activity's other artifacts — do not produce a separate `state` commit.
