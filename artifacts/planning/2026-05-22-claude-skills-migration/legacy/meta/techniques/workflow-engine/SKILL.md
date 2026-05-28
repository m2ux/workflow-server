---
name: workflow-engine
description: Operations and rules for executing a workflow's structured flow — session lifecycle, activity dispatch, transition evaluation, and checkpoint flow.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 6.1.0
  order: 0
  legacy_id: 0
---

# Workflow Engine

## Capability

Operations and rules for executing a workflow's structured flow — session lifecycle (list/match/scan/create), activity dispatch (next_activity, worker spawn, finalize), transition evaluation, post-activity commit, and the checkpoint protocol (yield/present/respond/resume).

## Operations

### Discovery and session

| Operation | Purpose |
|---|---|
| [list-workflows](list-workflows.md) | Retrieve the catalog of available workflows |
| [match-target-workflow](match-target-workflow.md) | Match a user request against the workflow catalog and surface ambiguity |
| [extract-identifying-context](extract-identifying-context.md) | Extract ticket, branch, PR, and work-package identifiers from a user request |
| [scan-saved-sessions](scan-saved-sessions.md) | Find saved client sessions matching a target workflow |
| [match-saved-session](match-saved-session.md) | Pick the saved-session candidate that best matches an identifying context |
| [create-session](create-session.md) | Dispatch a fresh client workflow as a child of the meta session |
| [handle-sub-workflow](handle-sub-workflow.md) | Dispatch a child workflow under the current session as its parent |

### Activity lifecycle

| Operation | Purpose |
|---|---|
| [compose-prompt](compose-prompt.md) | Substitute state variables into a prompt template resource |
| [dispatch-activity](dispatch-activity.md) | Transition the session to a target activity and spawn a worker for it |
| [finalize-activity](finalize-activity.md) | Compile the `activity_complete` result |
| [evaluate-transition](evaluate-transition.md) | Pick the next activity from the current activity's `transitions[]` |
| [commit-and-persist](commit-and-persist.md) | Post-activity hook: commit source-side changes and engineering artifacts |
| [verify-outcomes](verify-outcomes.md) | Compare a workflow's declared `outcome[]` against state and identify gaps |
| [generate-summary](generate-summary.md) | Compose the markdown session summary presented at workflow close |

### Checkpoint protocol

| Operation | Purpose |
|---|---|
| [yield-checkpoint](yield-checkpoint.md) | Worker — pause at a checkpoint and surface the yield |
| [present-checkpoint-to-user](present-checkpoint-to-user.md) | Meta-orchestrator — load the active checkpoint's details and present them to the user |
| [respond-checkpoint](respond-checkpoint.md) | Meta-orchestrator — send the user's selection back to the server, clearing the active checkpoint |
| [resume-from-checkpoint](resume-from-checkpoint.md) | Worker — continue execution after the orchestrator resolves a checkpoint |

## Rules

### session-index-passes-on-each-call

EVERY authenticated tool call (anything other than `discover`, `list_workflows`, `start_session`, `health_check`) requires a `session_index` parameter — the 6-character base32 string returned by `start_session`. The index is stable across all calls within a session; there is no rotation discipline.

### validation-warnings

Check `_meta.validation` in each response. Warnings are advisory but should be addressed.

### resource-loading-via-tool

Resource refs returned in operation bodies (e.g., [activity-worker-prompt](../../resources/activity-worker-prompt/SKILL.md)) are lightweight pointers. Load full content via `get_resource({ session_index, resource_id })`.
