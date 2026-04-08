---
id: client-dispatch-protocol
version: 1.1.0
---

# Client Dispatch Protocol

Documents the dispatch → monitor → complete lifecycle for client workflows in the hierarchical orchestrator model.

## Overview

The orchestration model uses a clean 3-tier hierarchy:

1. **`workflow-orchestrator`**: Top-level agent that runs the `meta` workflow. It is the ONLY agent allowed to interact with the user via `AskQuestion`.
2. **`activity-orchestrator`**: Sub-agent dispatched by the top-level orchestrator. It manages a complete client workflow (e.g. `work-package`), dispatching activities, evaluating transitions, and bubbling checkpoints up to the parent.
3. **`activity-worker`**: Sub-agent dispatched by the `activity-orchestrator`. It executes a single activity, follows steps, and bubbles checkpoints up to its parent.

## 1. Dispatch

The `workflow-orchestrator` dispatches a client workflow:

1. Call `dispatch_workflow({ workflow_id, parent_session_token, variables })` to create an independent client session.
2. Receive a dispatch package containing:
   - `client_session_token` — the token the `activity-orchestrator` uses
   - `client_session_id` — the sid for trace correlation
   - `initial_activity` — the first activity to execute
   - `worker_prompt` — the pre-composed prompt for the `activity-orchestrator` (from resource `meta/10`)
3. Save `client_session_token` and `client_session_id` in session state.
4. Spawn a new agent (Task/sub-agent) with the `worker_prompt`.

**Key invariant:** The parent session token and child session token are NEVER shared. Each agent holds only its own token.

## 2. Inline Management

The `workflow-orchestrator` does NOT manage transitions or poll. It dispatches the `activity-orchestrator` and awaits the result:

### Result: workflow_complete

When the `activity-orchestrator` finishes all activities:
1. Apply `variables_changed` from the result to session state.
2. Record the completed workflow.
3. Proceed to end-workflow.

### Result: checkpoint_pending

When the `activity-orchestrator` (or its worker) needs user input:
1. Present the bubbled checkpoint to the user via `AskQuestion`.
2. Receive the user's response.
3. Resume the `activity-orchestrator` with the user's chosen option.
4. Return to awaiting the next result.

**Checkpoint yield chain:** Sub-agents NEVER call `AskQuestion` directly. Checkpoints bubble up: `activity-worker` → `activity-orchestrator` → `workflow-orchestrator` → User.

## 3. Recursion

The model supports recursion. If a client workflow (e.g., `remediate-vuln`) needs to dispatch a sub-workflow:
1. The `activity-orchestrator` calls `dispatch_workflow({ workflow_id: "prism-update", parent_session_token: "<client_token>" })`.
2. It spawns a NEW `activity-orchestrator` for the sub-workflow.
3. The parent `activity-orchestrator` manages the child inline, bubbling its checkpoints further up the chain until they reach the top-level `workflow-orchestrator`.
