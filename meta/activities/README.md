# Meta Workflow Activities

> Part of the [Meta Workflow](../README.md)

The sequential activities that run inside the meta session. Each one's role and place in the sequence is indexed in the [Meta Workflow README](../README.md).

Borrowable mid-phase orchestration pattern activities live under [`patterns/`](./patterns/README.md) and are **not** part of this lifecycle list.

The authoritative definition of each activity — its steps, technique bindings, checkpoints, loop, transitions, and outcomes — lives in the linked `.yaml` file and is served by `get_activity`. The entries below are orientation only.

---

### 00. Discover Session

Derives the host repository the session belongs to from git — ascending to the outermost superproject that claims the workspace checkout — then identifies the target workflow and, when the request states resume intent, looks for an existing client session to resume. The derivation runs first so a divergence the server's basename-only mapping cannot represent is raised at the host-binding-mismatch checkpoint before any matching work is done; the same technique also runs at bootstrap step 1, which is where the meta session's own binding is fixed. It matches the user request against the workflow catalog and detects resume intent against the [resume-intent lexicon](../resources/resume-intent-lexicon.md); on stated intent it then extracts the request's identifying context (ticket, branch, PR, work-package name) and scans planning folders so saved progress can be surfaced. A request stating a fresh start skips that search. Leads to [Initialize Session](#01-initialize-session).

Definition: [`00-discover-session.yaml`](./00-discover-session.yaml)

---

### 01. Initialize Session

Gives the work package a stable, work-item-derived identity, then creates or resumes the client session as a child of the meta session. A fresh run derives the slug from the work item before dispatch so the server reuses it on every resume instead of a date-stamped fallback; a resuming run carries the matched session's slug through instead, so dispatch targets the existing planning folder. The server owns folder creation and returns the canonical `planning_folder_path`; on resume it restores prior variables automatically, so there is no agent-side restore. Leads to [Resolve Target](#02-resolve-target).

Definition: [`01-initialize-session.yaml`](./01-initialize-session.yaml)

---

### 02. Resolve Target

Detects the target repository structure — regular directory vs. submodule monorepo — and resolves `component_path` so downstream git operations have a confirmed working git tree to act on. For a monorepo the user picks the target submodule via a checkpoint; `component_path` is relative to `host_repo_path`, and their join must resolve to a directory containing a working git tree. Leads to [Dispatch Client Workflow](#03-dispatch-client-workflow).

Definition: [`02-resolve-target.yaml`](./02-resolve-target.yaml)

---

### 03. Dispatch Client Workflow

Drives the client workflow end to end inline via [`03-dispatch-client-workflow.yaml`](./03-dispatch-client-workflow.yaml) (dispatch → present/respond on yield → commit-and-persist → advance → continue that same worker while its batch has room). Each worker carries a bounded run of activities, so a fresh context is established once a run rather than once an activity; the bound is the server's, enforced at delivery ([batch-is-bounded-by-the-server](../techniques/workflow-engine/dispatch-activity.md#batch-is-bounded-by-the-server)). Role and auth boundaries: [agent-conduct](../techniques/agent-conduct.md) + [dispatch-activity](../techniques/workflow-engine/dispatch-activity.md). Leads to [End Workflow](#04-end-workflow) when the client workflow is exhausted.

Definition: [`03-dispatch-client-workflow.yaml`](./03-dispatch-client-workflow.yaml)

---

### 04. End Workflow

Closes out the client workflow: it verifies the client workflow's declared outcomes against final state, generates a session summary, and surfaces a completion checkpoint. Final state is already durably persisted by the server on every authenticated call, so no agent-side persist step is needed. If outcomes are unmet, the user can return to [Dispatch Client Workflow](#03-dispatch-client-workflow); otherwise the session is closed.

Definition: [`04-end-workflow.yaml`](./04-end-workflow.yaml)
