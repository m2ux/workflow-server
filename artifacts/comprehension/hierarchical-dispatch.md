# Hierarchical Dispatch — Comprehension Artifact

> **Last updated**: 2026-04-09  
> **Work package**: [#100 Hierarchical Dispatch](../planning/2026-04-08-hierarchical-dispatch/README.md)  
> **Coverage**: Dispatch tools (`dispatch_workflow`, `get_workflow_status`), session token relationship, trace correlation

## Architecture Overview

Hierarchical dispatch allows a "meta orchestrator" workflow to dispatch and manage "client" sub-workflows. This is implemented in the server via two dedicated tools in `src/tools/workflow-tools.ts`:

1.  **`dispatch_workflow`**: Creates a new, independent session for a target client workflow.
2.  **`get_workflow_status`**: Allows the meta orchestrator to poll the status of a dispatched client workflow.

### Design Patterns

1.  **Independent Sessions**: The client workflow gets its own independent session token and session ID (`sid`). It does **not** inherit state from the parent session. This maintains the stateless nature of the server and prevents state pollution between parent and child.
2.  **Trace Correlation**: While state is independent, the parent-child relationship is recorded in the trace store. The client's `sid` is initialized with a reference to the parent's `sid`, and a `dispatch_workflow` event is recorded in *both* the client's and the parent's traces.
3.  **Pre-composed Worker Prompt**: The `dispatch_workflow` tool loads a worker prompt template from a workflow resource (`meta/10`), populates it with the new client session details, and returns it to the meta orchestrator. This allows the meta orchestrator to directly hand off the prompt to a new sub-agent.

## Key Abstractions

| Construct | Role |
| :--- | :--- |
| `dispatch_workflow` | Tool to start a sub-workflow. Takes `workflow_id` and `parent_session_token`. Returns a new `client_session_token`, IDs, and a `client_prompt`. |
| `get_workflow_status` | Tool to poll a sub-workflow. Takes `client_session_token` (or ID + parent token). Returns `status` (active/blocked), `current_activity`, and trace-derived `completed_activities`. |
| Parent Session Token | Used for trace correlation during dispatch. The child token is completely separate. |
| Client Session Token | The new token generated for the sub-workflow. Passed to the sub-agent via the generated `client_prompt`. |

## Design Rationale

### Why Independent Sessions?
- **Hypothesized rationale**: To prevent state bleeding and keep the session tokens small. If a parent token contained all child state (or vice-versa), the token size would grow rapidly, eventually hitting context limits or causing serialization issues. Independent tokens keep the execution domains cleanly separated.
- **Trade-offs**: The meta orchestrator cannot directly access the client workflow's state variables; it must rely on `get_workflow_status` or artifacts produced by the client workflow.

### Why Server-Side Trace Correlation?
- **Hypothesized rationale**: To allow reconstructing the full execution tree later. Since the sessions are independent, the only way to know that Session B was spawned by Session A is to record that link at creation time in the trace store.
- **Trade-offs**: Relies on the (optional) server-side trace store. If tracing is disabled, the parent-child link might only exist in the meta orchestrator's context.

## Domain Concept Mapping

| Domain Term | Technical Construct | Description |
| :--- | :--- | :--- |
| Meta Orchestrator | Agent calling `dispatch_workflow` | The parent workflow managing sub-workflows. |
| Client Workflow | The workflow specified in `workflow_id` | The sub-workflow being dispatched. |
| Sub-Agent | The agent receiving the `client_prompt` | The agent executing the client workflow. |
| Worker Prompt | Template `meta/10` populated with vars | Instructions for the sub-agent to bootstrap itself. |

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| Q1 | Does `get_workflow_status` properly handle authorization when using only the client session ID? | Resolved | Uses parent token for auth, but does not strictly verify trace parentage. | DD-1 |
| Q2 | Are there any hardcoded assumptions in the worker prompt template (`meta/10`)? | Resolved | Yes. It hardcodes the `start_session` and `<checkpoint_yield>` instructions, explicitly acting as an orchestrator. | DD-2 |

## Initial Deep-Dive

*(Pending mandatory deep-dive)*

## Initial Deep-Dive

### DD-1: `get_workflow_status` Authorization

The `get_workflow_status` tool takes three optional arguments: `client_session_token`, `client_session_id`, and `parent_session_token`. If the `client_session_token` is not provided, the caller must provide *both* the `client_session_id` and the `parent_session_token` to authorize the read. The server decodes the parent token to verify the parent's identity. Currently, the server *does not* appear to fully enforce the parent-child link constraint explicitly (i.e. verifying in the trace store that `parent_session_token` actually spawned `client_session_id`), but rather uses it as an authorization credential mechanism before returning trace-derived data for that client sid.

### DD-2: Hardcoded Assumptions in Worker Prompt Template (`meta/10`)

The worker prompt template for dispatch is actually named `10-workflow-orchestrator-prompt.md`. It contains several hardcoded assumptions:
1.  **Bootstrap sequence**: It hardcodes the `start_session` → `get_workflow` sequence.
2.  **Orchestrator behavior**: It explicitly tells the sub-agent "Do NOT execute activities yourself. Your job is to orchestrate. Use the Task tool to dispatch an `activity-worker` for each activity."
3.  **Checkpoint Yield Format**: It hardcodes the expected `<checkpoint_yield>` JSON format for returning control to the parent orchestrator.

This indicates that `dispatch_workflow` isn't just dispatching *any* worker, it's dispatching a *meta-orchestrator* that will recursively manage its own sub-workers for activities.
