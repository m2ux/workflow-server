# Hierarchical Dispatch — Comprehension Artifact

> **Last updated**: 2026-06-18
> **Coverage**: Child-workflow dispatch (`dispatch_child`), the embedded work-package tree, parent-child correlation, `get_workflow_status` polling
> **Related artifacts**: [orchestration.md](orchestration.md), [workflow-server.md](workflow-server.md)

## Architecture Overview

Hierarchical dispatch allows a "meta orchestrator" workflow to dispatch and manage "client" sub-workflows. A parent session creates children with the dedicated `dispatch_child` tool; it then polls each child with `get_workflow_status`.

1.  **`dispatch_child`**: Appends a child entry under the parent's `triggeredWorkflows[]`, with the child's full `SessionFile` embedded inline. Returns the child's `session_index` and the canonical `planning_folder_path`. (`src/tools/resource-tools.ts:362`)
2.  **`get_workflow_status`**: Lets the orchestrator poll the status of a dispatched client workflow by its `session_index`. (`src/tools/workflow-tools.ts:789`)

`start_session` creates only fresh top-level sessions — it has no parent parameter. Children are dispatched via `dispatch_child` after `start_session` returns the index (`src/tools/resource-tools.ts:284`).

### Design Patterns

1.  **One File, Embedded Tree**: The entire work-package tree lives in a single top-level `session.json`. A child's complete `SessionFile` is embedded at `triggeredWorkflows[N].state`, and that schema is recursive via `z.lazy()` (`src/schema/session.schema.ts:120`, `:178`), so children may themselves dispatch grandchildren to arbitrary depth. Every node in the tree resides in that one file.
2.  **Isolated Per-Session State, Shared Container**: Each embedded session keeps its own `currentActivity`, `variables`, `completedActivities`, `checkpointResponses`, and `history`. State does not bleed between parent and child even though they share a file — the orchestrator does not inherit the child's activity state and vice versa.
3.  **`session_index` Addressing**: Every tool that operates on a session takes a `session_index` — a 6-character RFC 4648 base32 string (`/^[A-Z2-7]{6}$/`, `src/utils/session/store.ts:415`). Resolution walks the embedded `triggeredWorkflows[i].state` tree and matches each embedded SessionFile's stored `sessionIndex` (`src/utils/session/store.ts:446`). The agent threads the returned index to subsequent authenticated calls on that child.
4.  **Upward Link via `parentSession`**: A child carries an optional `parentSession?: SessionFile` upward link (also recursive via `z.lazy()`, `src/schema/session.schema.ts:171`). The depth of the parent chain is reported by `parentChainDepth` and surfaces a soft validation warning past a threshold (no hard ceiling) (`src/schema/session.schema.ts:210`, `src/tools/resource-tools.ts:315`).
5.  **Trace Correlation**: When tracing is enabled, `start_session` stamps the parent's index as `psid` and the chain depth as `pdepth` on the `start_session` trace event (`src/tools/resource-tools.ts:321`). `psid` is a trace field, not a token/state field.

## Key Abstractions

| Construct | Role |
| :--- | :--- |
| `dispatch_child` | Creates a child under the parent's `triggeredWorkflows[]`. Takes `session_index` (parent, any depth), `workflow_id`, optional `agent_id` (default `worker`), optional `planning_slug`. Returns the child's `session_index`, `workflow`, and `planning_folder_path`. |
| `get_workflow_status` | Polls a session by `session_index`. Returns `status` (active/blocked), `current_activity`, `completed_activities`, `variables`, `workflow`, `session_index`, plus `last_checkpoint` and `parent` when present. |
| `triggeredWorkflows[]` | Parent-side array of `EmbeddedSessionRef`. Each entry has `workflowId`, `sessionIndex`, `triggeredAt`, `triggeredFrom`, `status` (running/completed/aborted/error), optional `completedAt`/`returnedContext`, and the embedded child `state` (`src/schema/session.schema.ts:178`). |
| `parentSession` | Optional upward `SessionFile` link on a child, used for correlation and for flipping the parent's `triggeredWorkflows[i].status` on completion. |
| `session_index` | 6-char base32 handle used to address and authenticate operations on any session in the tree. |

## Design Rationale

### Why one embedded file instead of independent sessions?
- **Rationale**: Keeping the whole work-package tree in one `session.json` means a single durable, HMAC-sealed artifact captures the entire dispatch topology — parent, children, and grandchildren — so the execution tree can be reconstructed directly from state without reassembling separate files. The recursive `z.lazy()` schema lets arbitrary nesting reuse one shape.
- **Trade-offs**: The top-level file grows with the tree, and writes to any node rewrite the top-level file (resolution is by stored `sessionIndex`, not by path). State stays isolated per node despite sharing the container.

### Why `dispatch_child` instead of `start_session` with a parent flag?
- **Rationale**: `start_session` only ever creates fresh top-level sessions (or resumes one). Dispatch is a distinct operation: it mutates the parent (appends to `triggeredWorkflows[]`, pushes a `workflow_triggered` history entry) and embeds a new child SessionFile. A dedicated tool keeps the parent-mutating semantics explicit and out of the session-bootstrap path.
- **Trade-offs**: Two calls are needed for a meta-bootstrap flow (`start_session` then `dispatch_child`), and `dispatch_child` carries a special promotion branch for transient parents (see below).

### Transient-parent promotion
- A meta-bootstrap `start_session` with no planning folder creates a transient session in `os.tmpdir()`. The first `dispatch_child` promotes that transient parent onto a stable workspace planning folder, embeds the child under `triggeredWorkflows[0].state`, discards the tmp folder, and repoints the parent's `session_index` at the promoted folder so the orchestrator's original index keeps authenticating (`src/tools/resource-tools.ts:389`). The promoted slug is taken from `planning_slug` → the slug registered at `start_session` → a `YYYY-MM-DD-<workflow-id>` fallback.

### Why server-side correlation?
- **Rationale**: The full tree is in state, so correlation is structural (`triggeredWorkflows` downward, `parentSession` upward). Trace events add a redundant `psid`/`pdepth` view for reconstructing flows when the trace store is enabled.
- **Trade-offs**: The `psid` trace link only exists while tracing is on; the authoritative correlation always lives in the embedded tree.

## Domain Concept Mapping

| Domain Term | Technical Construct | Description |
| :--- | :--- | :--- |
| Meta Orchestrator | Agent calling `dispatch_child` with its own `session_index` | The parent workflow managing sub-workflows. |
| Client Workflow | The workflow named in `workflow_id`, embedded at `triggeredWorkflows[N].state` | The sub-workflow being dispatched. |
| Sub-Agent | The agent receiving the child `session_index` (default `agent_id` `worker`) | The agent executing the client workflow. |
| Parent Context | `parentSession` (child upward link); `psid`/`pdepth` (trace event) | Links child session to parent for correlation. |

## `get_workflow_status` Internals

The `get_workflow_status` tool (in `src/tools/workflow-tools.ts:789`) derives status from the on-disk session state and the trace store:

1. Load the session by `session_index` (`loadSessionForTool`), reading the embedded `SessionFile`.
2. Load workflow metadata via `loadWorkflow` (for id/version/title).
3. Determine `status`:
   - `blocked` if `state.activeCheckpoint` is set
   - `active` otherwise
   (The handler emits only `active`/`blocked`, even though the tool description advertises `completed` — see Open Questions.)
4. `completed_activities` come from authoritative `state.completedActivities`; the trace-derived scan (`next_activity` events with `s: 'ok'`) is only a fallback when state is empty (`:816`).
5. `last_checkpoint` is the most recent `respond_checkpoint` trace event with `s: 'ok'` (`:827`).
6. Always include `variables` (the rolled-up session variable bag) and `session_index`.
7. Include `parent` (`{ session_index, workflow_id, activity, version }`) when `state.parentSession` is present (`:845`).

`get_workflow_status` reads but does not advance — it leaves on-disk state stable and is excluded from the trace.

### Child completion notification

When a child reaches its terminal activity, `next_activity` sets `state.status = 'completed'` on the child (`src/tools/workflow-tools.ts:271`) and, best-effort, flips the matching parent `triggeredWorkflows[i].status` from `running` to `completed` (stamping `completedAt` and pushing a `workflow_returned` history entry) (`:280`). This applies to persistent parents only; a transient parent has no persisted node to update, since promotion discards its tmp folder.

## Open Questions

| # | Question | Status | Notes |
|---|----------|--------|------------|
| Q1 | Does dispatch / status authorization rely on the session handle alone? | Answered | Yes. Operations are authenticated by `session_index` resolving to a sealed on-disk `SessionFile`; authorization has no separate layer. |
| Q2 | How does the server track "completed" status? | Answered | The `SessionFile` carries a lifecycle `status` enum (`running`/`completed`/`aborted`, `src/schema/session.schema.ts:113`), set to `completed` when `next_activity` reaches the terminal activity (`src/tools/workflow-tools.ts:271`). The parent's `triggeredWorkflows[i].status` is flipped in lockstep. |
| Q3 | Why does `get_workflow_status` return only `active`/`blocked` when both the tool description and `SessionFile.status` know about `completed`? | Open | The handler derives status from `activeCheckpoint` only (`src/tools/workflow-tools.ts:805`) and does not consult `state.status`, so a terminated child reports `active`. Either the handler should read `state.status` or the description should be narrowed. |
| Q4 | What is the practical/enforced depth limit of the embedded tree? | Open | Depth has no hard ceiling; depth past a soft threshold emits a validation warning (`src/tools/resource-tools.ts:315`). Whether very deep trees stress file size or write contention is unmeasured. |

---
*This artifact is part of a persistent knowledge base.*
