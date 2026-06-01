# Meta Workflow Activities

> Part of the [Meta Workflow](../README.md)

Five sequential activities that run inside the meta session: identify the target client workflow and any saved session, create or resume the client session, resolve target_path, dispatch the client orchestrator and mediate its checkpoint loop, and close out the session.

---

### 00. Discover Session

**Purpose:** Identify the user's intended target workflow and search for an existing client session to resume. Calls `list_workflows`, matches the user request against the workflow catalog, scans planning folders for saved sessions matching the request's identifying context (ticket, branch, PR, work-package name), and presents resume / workflow-selection checkpoints.

**Skills:** primary [`activity-worker`](../skills/README.md#activity-worker) (resolved via universal-skill fallback)

**Steps:**

1. **list-available-workflows** — Call `list_workflows` to retrieve the catalog
2. **identify-target** — Match user request to a workflow_id; extract identifying context; flag ambiguity if multiple candidates
3. **scan-planning-folders** — List directories under `.engineering/artifacts/planning/` and read each `session.json` whose `workflowId` matches `target_workflow_id`
4. **match-session** — Compare identifying context against saved candidates; select most recently updated on a tie
5. **record-match / record-no-match** — Set `has_saved_state`, `saved_planning_slug`, `planning_folder_path`

**Checkpoints:**

- `workflow-selection` (conditional on `workflow_match_ambiguous == true`) — confirm or re-prompt for the target workflow
- `resume-session` (conditional on `has_saved_state == true`) — resume previous session or start fresh

**Transitions:** Default to [Initialize Session](#01-initialize-session).

---

### 01. Initialize Session

**Purpose:** Create or resume the client workflow's session as a child of the meta session via a single `start_session` call. The server resolves whether the call creates a fresh session or rebinds an existing `session.json` on disk; the agent issues one call regardless. On resume the server reads the existing `session.json` keyed by `planning_slug` and returns its `session_index`; on a fresh start the server creates `session.json` and writes its `.session-token` seal atomically. Variables are restored automatically by the server on resume — there is no agent-side restore step.

**Skills:** primary [`activity-worker`](../skills/README.md#activity-worker) (resolved via universal-skill fallback)

**Steps:**

1. **start-or-resume-session** — `workflow-engine::create-session(parent_session_index, workflow_id)`. Capture `client_session_index` from the response. The server appends the child under `meta.triggeredWorkflows[N].state` (or creates a new top-level workspace folder when meta is transient).
2. **derive-planning-folder** — Conditional on a fresh session: `version-control::initialize-folder` to create the planning folder on disk.

**Transitions:** Default to [Resolve Target](#02-resolve-target).

---

### 02. Resolve Target

**Purpose:** Detect the target repository structure (regular vs. submodule monorepo) and resolve `target_path`. Skipped when `target_path` was already restored from the server-managed `session.json`.

**Skills:** primary [`activity-worker`](../skills/README.md#activity-worker) (resolved via universal-skill fallback)

**Steps:**

1. **detect-monorepo** — Check for `.gitmodules` to determine repo type
2. **list-submodules** — Conditional on `is_monorepo == true`: parse `.gitmodules` and present submodule paths
3. **capture-target-path** — Set `target_path` (root for regular, selected submodule for monorepo)

**Checkpoints:**

- `repo-type-confirmed` — confirm regular vs. monorepo (sets `is_monorepo` and, for regular, `target_path`)

**Transitions:** Default to [Dispatch Client Workflow](#03-dispatch-client-workflow).

---

### 03. Dispatch Client Workflow

**Purpose:** Compose the workflow-orchestrator prompt, dispatch the orchestrator (sub-agent in spawning harnesses, inline persona otherwise), and drive the checkpoint-yield loop. Each iteration: parse the orchestrator's most recent output; on `<checkpoint_yield>`, read the active checkpoint from the server-managed `session.json#activeCheckpoint` via `present_checkpoint`, capture the user's selection, and resume the orchestrator with the resolved effects; on `workflow_complete`, exit the loop.

**Skills:** primary [`activity-worker`](../skills/README.md#activity-worker), supporting [`harness-compat`](../skills/README.md#harness-compat) (resolved via universal-skill fallback)

**Entry actions:** `validate` `client_session_index` is set.

**Steps:**

1. **compose-orchestrator-prompt** — Build the orchestrator prompt from resource [`workflow-orchestrator-prompt`](../resources/workflow-orchestrator-prompt.md), substituting `session_index` and other context.
2. **dispatch-orchestrator** — `harness-compat::spawn-agent` (foreground, blocking).

**Loop:** `checkpoint-loop` — `doWhile` (`condition: client_workflow_completed == false`, `maxIterations: 200`)

| Loop step | Description |
|-----------|-------------|
| `capture-checkpoint-yield` | `workflow-engine::extract-checkpoint-handle` — `<checkpoint_yield>` has no payload; the active checkpoint is read from `session.json#activeCheckpoint` |
| `capture-workflow-complete` | `workflow-engine::handle-workflow-complete` on `workflow_complete` results |
| `present-and-resolve` | `present_checkpoint({ session_index })` to surface the active checkpoint, then `AskQuestion` for the user's selection |
| `respond-checkpoint` | `respond_checkpoint({ session_index, option_id })` (or `auto_advance` / `condition_not_met`) |
| `continue-orchestrator` | `harness-compat::continue-agent` with the resolved effects |

**Transitions:** To [End Workflow](#04-end-workflow) when `client_workflow_completed == true`.

---

### 04. End Workflow

**Purpose:** Verify the client workflow's outcomes, generate a session summary, and confirm closure. The final state is already durably persisted by the server on every authenticated tool call; no agent-side persist step is required. If the user opts to return to the workflow, transitions back to dispatch with `abort_completion = true`.

**Skills:** primary [`activity-worker`](../skills/README.md#activity-worker) (resolved via universal-skill fallback)

**Steps:**

1. **verify-outcomes** — Read the client workflow's `outcome[]` and check satisfaction.
2. **generate-summary** — Compose a markdown summary (workflow id, dates, activities, decisions, artifacts, outcomes met/unmet, follow-ups).

**Checkpoints:**

- `completion-confirmed` — confirm closure or return to workflow (sets `abort_completion`; `transitionTo: dispatch-client-workflow` when returning)

**Exit actions:** `log: "Workflow session closed"`.

**Transitions:** Terminal under `confirm`. Returns to [Dispatch Client Workflow](#03-dispatch-client-workflow) under `return`.
