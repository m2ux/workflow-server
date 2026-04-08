---
id: workflow-bootstrap
version: 1.1.0
---

# Bootstrap Procedure

## Session Token Rule

`start_session` returns a `session_token`. **Every tool call after `start_session` requires `session_token` as a parameter.** Each tool response returns an updated token — always use the most recent one. There is no `workflow_id` parameter on these tools; the workflow is encoded inside the token.

## Starting a Session

1. **discover** — Call first (no parameters). Returns the server info, available workflows, and this bootstrap procedure.
2. **list_workflows** — Match the user's goal to a workflow from the returned list. No session token needed.
3. **start_session(`workflow_id: "meta"`)** — Start a meta session.
4. **get_skills(`session_token`)** — Load behavioral protocols for the meta session.
5. **get_workflow(`session_token`, `summary=true`)** — Load the meta workflow structure.
6. **next_activity(`session_token`, `activity_id`)** — Execute either `start-workflow` or `resume-workflow` based on the user's intent. These activities handle discovering target submodules, loading state, and dispatching the client workflow via `dispatch_workflow`.

## Sub-Agent Dispatch and Initialization

The orchestration model uses a 3-tier hierarchy: `workflow-orchestrator` (meta), `activity-orchestrator` (client workflow), and `activity-worker` (activity execution).

### Dispatching an Activity Orchestrator

The top-level `workflow-orchestrator` starts a client workflow by calling `dispatch_workflow`:
- **dispatch_workflow(`workflow_id`, `parent_session_token`, `variables`)** — Creates a new, independent client session. It returns a dispatch package containing the `client_session_token`, `initial_activity`, and a pre-composed `worker_prompt`.
- **Note:** The `activity-orchestrator` does NOT inherit the `workflow-orchestrator`'s token. They are independent sessions correlated in the trace.

### Dispatching an Activity Worker (Token Inheritance)

When the `activity-orchestrator` dispatches an `activity-worker` to execute an activity, the worker **must inherit the orchestrator's token** to share the session state:
- **start_session(`workflow_id`, `session_token`, `agent_id`)** — The worker calls this using the `activity-orchestrator`'s token. The returned token inherits `sid`, `act`, `pcp`, `pcpt`, and all state from the parent. The `agent_id` is stamped into the signed `aid` field (e.g., `"worker-1"`).
- This ensures the worker cannot bypass checkpoint obligations — pending checkpoints from `next_activity` carry over into the inherited token.

## Checkpoint Gate

When `next_activity` loads an activity with required checkpoints, those checkpoint IDs are embedded in the session token. **All tools are blocked until every checkpoint is resolved via `respond_checkpoint`.** 

- **Sub-agents (`activity-orchestrator` and `activity-worker`) NEVER call AskQuestion.** They must yield `checkpoint_pending` to their parent orchestrator.
- The top-level `workflow-orchestrator` is the only agent permitted to call `AskQuestion`. It receives bubbled checkpoints, presents them to the user, and calls `respond_checkpoint`.

## Loading Skills and Resources

- **get_skills(`session_token`)** — Load all workflow-level behavioral protocols (e.g. session-protocol).
- **get_skill(`session_token`, `step_id`)** — Load the specific skill for a step during activity execution. Returns the skill definition with `_resources` containing lightweight references (index, id, version — no content).
- **get_resource(`session_token`, `resource_index`)** — Load a resource's full content by index. Call this for each entry in `_resources` to load the content the skill requires. Supports cross-workflow refs (e.g., `meta/04`).
