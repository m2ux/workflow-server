# Meta Workflow Activities

> Part of the [Meta Workflow](../README.md)

Five sequential activities that run inside the meta session: identify the target client workflow and any saved session, create or resume the client session, resolve target_path, drive the client workflow's activity loop inline and mediate its yielded checkpoints, and close out the session.

Borrowable mid-phase orchestration pattern activities live under [`patterns/`](./patterns/README.md) and are **not** part of this lifecycle list.

The authoritative definition of each activity — its steps, technique bindings, checkpoints, loop, transitions, and outcomes — lives in the linked `.yaml` file and is served by `get_activity`. The entries below are orientation only.

---

### 00. Discover Session

Identifies the target workflow and looks for an existing client session to resume. It matches the user request against the workflow catalog, extracts the request's identifying context (ticket, branch, PR, work-package name), and scans planning folders so saved progress can be surfaced — even when the user said "start". It can surface a workflow-selection checkpoint (when the match is ambiguous) and a resume-session checkpoint (when saved state is found). Leads to [Initialize Session](#01-initialize-session).

Definition: [`00-discover-session.yaml`](./00-discover-session.yaml)

---

### 01. Initialize Session

Gives the work package a stable, work-item-derived identity, then creates or resumes the client session as a child of the meta session. The slug is derived from the work item before dispatch so the server reuses it on every resume instead of a date-stamped fallback. The server owns folder creation and returns the canonical `planning_folder_path`; on resume it restores prior variables automatically, so there is no agent-side restore. Leads to [Resolve Target](#02-resolve-target).

Definition: [`01-initialize-session.yaml`](./01-initialize-session.yaml)

---

### 02. Resolve Target

Detects the target repository structure — regular directory vs. submodule monorepo — and resolves `target_path` so downstream git operations have a confirmed working git tree to act on. For a monorepo the user picks the target submodule via a checkpoint; `target_path` must resolve to a directory containing a working git tree. Leads to [Dispatch Client Workflow](#03-dispatch-client-workflow).

Definition: [`02-resolve-target.yaml`](./02-resolve-target.yaml)

---

### 03. Dispatch Client Workflow

Drives the client workflow end to end inline. The orchestrator dispatches each client activity to a worker, mediates any yielded checkpoint with the user, commits and persists completed-activity artifacts, and evaluates transitions to advance — looping until the client workflow has no further activities. Every tool call inside the loop authenticates with `client_session_index`; the meta `session_index` is used only at activity boundaries and at close-out. The user retains control at every decision point. Leads to [End Workflow](#04-end-workflow) when the client workflow is exhausted.

Definition: [`03-dispatch-client-workflow.yaml`](./03-dispatch-client-workflow.yaml)

---

### 04. End Workflow

Closes out the client workflow so the user can decide whether the work is truly done: it verifies the client workflow's declared outcomes against final state, generates a session summary, and surfaces a completion checkpoint. Final state is already durably persisted by the server on every authenticated call, so no agent-side persist step is needed. The completed session can be resumed or audited later. If outcomes are unmet, the user can return to [Dispatch Client Workflow](#03-dispatch-client-workflow); otherwise the session is closed.

Definition: [`04-end-workflow.yaml`](./04-end-workflow.yaml)
