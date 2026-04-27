# Meta Workflow Activities

> Part of the [Meta Workflow](../README.md)

Five sequential activities that run inside the meta session: identify the target client workflow and any saved session, create or adopt the client session, resolve target_path, dispatch the client orchestrator and mediate its checkpoint loop, and close out the session.

---

### 00. Discover Session

**Purpose:** Identify the user's intended target workflow and search for an existing client session to resume. Calls `list_workflows`, matches the user request against the workflow catalog, scans planning folders for saved sessions matching the request's identifying context (ticket, branch, PR, work-package name), and presents resume / workflow-selection checkpoints.

**Skills:** primary [`activity-worker`](../skills/README.md#09--activity-worker), supporting [`state-management`](../skills/README.md#02--state-management)

**Steps:**

1. **list-available-workflows** — Call `list_workflows` to retrieve the catalog
2. **identify-target** — Match user request to a workflow_id; extract identifying context; flag ambiguity if multiple candidates
3. **scan-planning-folders** — List directories under `.engineering/artifacts/planning/` and read each `workflow-state.toon` whose `workflowId` matches `target_workflow_id`
4. **match-session** — Compare identifying context against saved candidates; select most recently updated on a tie
5. **prepare-result** — Set `has_saved_state`, `saved_session_token`, `planning_folder_path`

**Checkpoints:**

- `workflow-selection` (conditional on `workflow_match_ambiguous == true`) — confirm or re-prompt for the target workflow
- `resume-session` (conditional on `has_saved_state == true`) — resume previous session or start fresh

**Transitions:** Default to [Initialize Session](#01-initialize-session).

---

### 01. Initialize Session

**Purpose:** Create or adopt the client workflow's session as a child of the meta session. If `is_resuming`: adopt the saved client session via `start_session({ session_token })` and restore variables via `restore_state`. Otherwise: create a fresh child session via `start_session({ workflow_id, parent_session_token })` and create the planning folder.

**Skills:** primary [`activity-worker`](../skills/README.md#09--activity-worker), supporting [`session-protocol`](../skills/README.md#00--session-protocol), [`state-management`](../skills/README.md#02--state-management), [`version-control`](../skills/README.md#03--version-control)

**Steps:**

1. **start-or-adopt-session** — Single `start_session` call branching on `has_saved_state`
2. **detect-recovery** — Inspect the response for `adopted: true` / `recovered: true` and set the recovery flags
3. **restore-state** — Conditional on `is_resuming`: call `restore_state` to load variables from `workflow-state.toon`
4. **derive-planning-folder** — Conditional on fresh session: derive `planning_folder_path` from request context
5. **initialize-folder** — Conditional on fresh session: create the folder and write the initial state via `save_state`

**Transitions:** Default to [Resolve Target](#02-resolve-target).

---

### 02. Resolve Target

**Purpose:** Detect the target repository structure (regular vs. submodule monorepo) and resolve `target_path`. Skipped when `target_path` was already restored from saved state.

**Skills:** primary [`activity-worker`](../skills/README.md#09--activity-worker)

**Steps:**

1. **detect-monorepo** — Check for `.gitmodules` to determine repo type
2. **list-submodules** — Conditional on `is_monorepo == true`: parse `.gitmodules` and present submodule paths
3. **capture-target-path** — Set `target_path` (root for regular, selected submodule for monorepo)

**Checkpoints:**

- `repo-type-confirmed` — confirm regular vs. monorepo (sets `is_monorepo` and, for regular, `target_path`)

**Transitions:** Default to [Dispatch Client Workflow](#03-dispatch-client-workflow).

---

### 03. Dispatch Client Workflow

**Purpose:** Compose the workflow-orchestrator prompt, dispatch the orchestrator (sub-agent in spawning harnesses, inline persona otherwise), and drive the checkpoint-yield loop. Each iteration: parse the orchestrator's most recent output; if `<checkpoint_yield>`, present the checkpoint, capture the user's selection, resume the orchestrator with effects; if `workflow_complete`, exit the loop.

**Skills:** primary [`activity-worker`](../skills/README.md#09--activity-worker), supporting [`meta-orchestrator`](../skills/README.md#08--meta-orchestrator), [`harness-compat`](../skills/README.md#11--harness-compat), [`session-protocol`](../skills/README.md#00--session-protocol)

**Entry actions:** `validate` `client_session_token` is set.

**Steps:**

1. **compose-orchestrator-prompt** — Build the orchestrator prompt from resource [`workflow-orchestrator-prompt`](../resources/02-workflow-orchestrator-prompt.md)
2. **dispatch-orchestrator** — `harness-compat::spawn-agent` (foreground, blocking)

**Loop:** `checkpoint-loop` — `doWhile` (`condition: client_workflow_completed == false`, `maxIterations: 200`)

| Loop step | Description |
|-----------|-------------|
| `parse-orchestrator-result` | Extract `checkpoint_handle` from `<checkpoint_yield>` or detect `workflow_complete` |
| `present-checkpoint` | `present_checkpoint({ checkpoint_handle })` |
| `ask-user` | `AskQuestion` (blocking) or chat + Shell `sleep` (advisory autoAdvanceMs) |
| `respond-checkpoint` | `respond_checkpoint({ checkpoint_handle, option_id })` (or `auto_advance` / `condition_not_met`) |
| `continue-orchestrator` | `harness-compat::continue-agent` with the resolved effects |

**Transitions:** To [End Workflow](#04-end-workflow) when `client_workflow_completed == true`.

---

### 04. End Workflow

**Purpose:** Verify the client workflow's outcomes, generate a session summary, persist final state via `save_state`, and confirm closure. If the user opts to return to the workflow, transitions back to dispatch with `abort_completion = true`.

**Skills:** primary [`activity-worker`](../skills/README.md#09--activity-worker), supporting [`state-management`](../skills/README.md#02--state-management), [`meta-orchestrator`](../skills/README.md#08--meta-orchestrator)

**Steps:**

1. **verify-outcomes** — Read the client workflow's `outcome[]` and check satisfaction
2. **generate-summary** — Compose a markdown summary (workflow id, dates, activities, decisions, artifacts, outcomes met/unmet, follow-ups)
3. **final-persist** — `save_state` with the final variable state and status `completed`

**Checkpoints:**

- `completion-confirmed` — confirm closure or return to workflow (sets `abort_completion`; `transitionTo: dispatch-client-workflow` when returning)

**Exit actions:** `log: "Workflow session closed"`.

**Transitions:** Terminal under `confirm`. Returns to [Dispatch Client Workflow](#03-dispatch-client-workflow) under `return`.
