# Hierarchical Dispatch — Comprehension Artifact

> **Last updated**: 2026-04-26
> **Coverage**: Session dispatch, parent-child trace correlation, `get_workflow_status` polling
> **Related artifacts**: [orchestration.md](orchestration.md), [workflow-server.md](workflow-server.md)

## Architecture Overview

Hierarchical dispatch allows a "meta orchestrator" workflow to dispatch and manage "client" sub-workflows. This is implemented via `start_session` with `parent_session_token`, not via a separate dispatch tool.

1.  **`start_session` with `parent_session_token`**: Creates a new child session for a target workflow with parent context embedded for trace correlation.
2.  **`get_workflow_status`**: Allows the meta orchestrator to poll the status of a dispatched client workflow.

### Design Patterns

1.  **Independent Sessions**: The client workflow gets its own independent session token and session ID (`sid`). It does **not** inherit activity state from the parent session. This maintains the stateless nature of the server and prevents state pollution between parent and child.
2.  **Trace Correlation**: While state is independent, the parent-child relationship is recorded in the trace store. The child's `sid` is initialized with a reference to the parent's `sid`, and a `start_session` event is recorded in *both* the parent's and the child's traces.
3.  **Parent Context in Token**: The child token carries `psid`, `pwf`, `pact`, `pv` fields linking back to the parent session.

## Key Abstractions

| Construct | Role |
| :--- | :--- |
| `start_session` with `parent_session_token` | Creates a child session. Takes `workflow_id` and `parent_session_token`. Embeds parent context in the new token. |
| `get_workflow_status` | Polls a workflow session. Takes `session_token`. Returns `status` (active/blocked/completed), `current_activity`, `completed_activities`, `last_checkpoint`, `workflow`, and `parent` context. |
| Parent Session Token | Used for trace correlation during dispatch. The child token is completely separate. |
| Child Session Token | The new token generated for the sub-workflow. Passed to the sub-agent. |

## Design Rationale

### Why Independent Sessions?
- **Rationale**: To prevent state bleeding and keep the session tokens small. If a parent token contained all child state, the token size would grow rapidly. Independent tokens keep the execution domains cleanly separated.
- **Trade-offs**: The meta orchestrator cannot directly access the client workflow's state variables; it must rely on `get_workflow_status` or artifacts produced by the client workflow.

### Why `start_session` instead of a separate `dispatch_workflow` tool?
- **Rationale**: `start_session` already handles session creation, workflow selection, agent ID assignment, and token inheritance. Adding `parent_session_token` extends it naturally without introducing a new tool. The dispatch is just a session creation with context.
- **Trade-offs**: The dispatch logic is co-located with general session management, which may make the `start_session` handler more complex.

### Why Server-Side Trace Correlation?
- **Rationale**: To allow reconstructing the full execution tree later. Since the sessions are independent, the only way to know that Session B was spawned by Session A is to record that link at creation time in the trace store.
- **Trade-offs**: Relies on the in-memory trace store. If tracing is disabled, the parent-child link might only exist in the meta orchestrator's context.

## Domain Concept Mapping

| Domain Term | Technical Construct | Description |
| :--- | :--- | :--- |
| Meta Orchestrator | Agent calling `start_session` with `parent_session_token` | The parent workflow managing sub-workflows. |
| Client Workflow | The workflow specified in `workflow_id` | The sub-workflow being dispatched. |
| Sub-Agent | The agent receiving the child token | The agent executing the client workflow. |
| Parent Context | `psid`, `pwf`, `pact`, `pv` in child token | Links child session to parent for trace correlation. |

## `get_workflow_status` Internals

The `get_workflow_status` tool (in `workflow-tools.ts`) derives status from the decoded token and trace store:

1. Decode `session_token` to get `sid`, `wf`, `act`, `bcp`, `psid`
2. Load workflow metadata via `loadWorkflow`
3. Determine `status`:
   - `blocked` if `bcp` is set
   - `active` otherwise (the server does not track "completed" explicitly; this is inferred by the orchestrator)
4. Derive `completed_activities` by scanning trace events for `next_activity` with `s: 'ok'` and collecting unique `act` values
5. Find `last_checkpoint` from the most recent `respond_checkpoint` event
6. Include `parent` context if `psid` is present in the token

## Open Questions

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| Q1 | Does `get_workflow_status` properly handle authorization? | Resolved | Uses the session token itself for auth. No additional authorization layer. |
| Q2 | How does the server track "completed" status? | Resolved | It does not track completion explicitly. The orchestrator infers completion when `next_activity` would transition to a non-existent activity or when all activities have been visited. |

---
*This artifact is part of a persistent knowledge base.*
