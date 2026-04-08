---
id: client-dispatch-protocol
version: 1.0.0
---

# Client Dispatch Protocol

Documents the dispatch → monitor → complete lifecycle for client workflows in the hierarchical orchestrator model.

## Overview

In the hierarchical model, the meta orchestrator dispatches client workflows to independent sub-agents. Each client receives its own session token and operates autonomously. The meta orchestrator manages clients inline — it dispatches, awaits results, handles checkpoint yields, and evaluates transitions without polling.

## 1. Dispatch

The meta orchestrator dispatches a client workflow after `discover-session` resolves the target:

1. Call `dispatch_workflow({ workflow_id, parent_session_token, variables })` to create an independent client session.
2. Receive a dispatch package containing:
   - `client_session_token` — the token the client agent uses
   - `client_session_id` — the sid for trace correlation
   - `initial_activity` — the first activity to execute
   - `worker_prompt` — the pre-composed prompt for the client agent
3. Save `client_session_token` and `client_session_id` in session state (via `save_state`).
4. Spawn a new agent (Task/sub-agent) with the `worker_prompt`.

**Key invariant:** The meta session token and client session token are NEVER shared. The meta agent holds the meta token; the client agent holds the client token.

## 2. Inline Management

The meta orchestrator does NOT poll. It dispatches the client agent and awaits the result inline:

### Result: activity_complete

When the client finishes an activity:
1. Apply `variables_changed` from the client result to session state.
2. Record the completed activity.
3. Call `get_workflow_status` to check if the client workflow has more activities.
4. If more activities: dispatch the next activity to the client agent.
5. If workflow complete: proceed to end-workflow.

### Result: checkpoint_pending

When the client needs user input:
1. Present the checkpoint to the user via `AskQuestion`.
2. Receive the user's response.
3. Resume the client agent with `checkpoint_response` containing the response.
4. Return to awaiting the next result.

**Checkpoint yield chain:** Workers never call `AskQuestion` directly. Checkpoints bubble up through the hierarchy: Worker → Client Agent → Meta Orchestrator → User.

## 3. Complete

When all client workflows are complete:
1. Summarize results from all clients.
2. Proceed to the `end-workflow` activity.
3. Client results are available via `get_workflow_status` or `get_trace`.

## Parent-Child Session Correlation

When `dispatch_workflow` creates a client session, it stores the meta session's `sid` as `parent_sid` (psid) in the client session payload. This enables:
- `get_trace` to optionally include parent/child trace events
- Debugging: "which meta session dispatched this client?"

This is **metadata only** — it does not grant the client access to the parent session or vice versa.

## Recursion

The model supports recursion. If a client workflow (e.g., `remediate-vuln`) needs to dispatch a sub-workflow (e.g., `prism-update`):
1. The client calls `dispatch_workflow({ workflow_id: "prism-update", parent_session_token: "<client_token>" })`.
2. Gets a new dispatch package with a sub-client session token.
3. Spawns a new agent for the sub-workflow.
4. Manages the sub-client inline using the same protocol.

Each layer only knows about its immediate children — no cross-layer confusion.
