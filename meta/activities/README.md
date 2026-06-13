# Meta Workflow Activities

> Part of the [Meta Workflow](../README.md)

Five sequential activities that run inside the meta session: identify the target client workflow and any saved session, create or resume the client session, resolve target_path, drive the client workflow's activity loop inline and mediate its yielded checkpoints, and close out the session.

---

### 00. Discover Session

**Purpose:** Identify the target workflow and search for an existing client session to resume. Lists workflows, matches the user request against the workflow catalog, extracts the request's identifying context (ticket, branch, PR, work-package name), scans planning folders for saved sessions of the target workflow, matches saved candidates, and records the match decision.

**Steps:** (7) — each binds a `workflow-engine` operation except the two terminal record steps.

| # | Step | Binds | Condition |
|---|------|-------|-----------|
| 1 | `list-available-workflows` | `workflow-engine::list-workflows` | — |
| 2 | `match-target` | `workflow-engine::match-target-workflow` | — |
| 3 | `extract-context` | `workflow-engine::extract-identifying-context` | — |
| 4 | `scan-planning-folders` | `workflow-engine::scan-saved-sessions` | — |
| 5 | `match-session` | `workflow-engine::match-saved-session` | — |
| 6 | `record-match` | prose — set `has_saved_state = true`, copy `saved_planning_slug` and `planning_folder_path` from the matched candidate | `has_saved_state == true` |
| 7 | `record-no-match` | prose — set `has_saved_state = false`; the resume-session checkpoint will not fire | `has_saved_state == false` |

**Supporting techniques:** `workflow-engine::list-workflows`, `match-target-workflow`, `extract-identifying-context`, `scan-saved-sessions`, `match-saved-session`.

**Rule:** Match identifying context against saved sessions even when the user said "start" — surface saved state via the resume-session checkpoint.

**Checkpoints:** (2)

- `workflow-selection` (conditional on `workflow_match_ambiguous == true`) — confirm or re-prompt for the target workflow
- `resume-session` (conditional on `has_saved_state == true`) — resume previous session or start fresh

**Transitions:** Default to [Initialize Session](#01-initialize-session).

---

### 01. Initialize Session

**Purpose:** Derive the client planning slug, then dispatch the client workflow as a child of the meta session via `create-session`. The slug must be derived from the work item BEFORE the dispatch promotes the meta — otherwise the server falls back to `YYYY-MM-DD-<workflow_id>`. The server resolves whether the call creates a fresh session or rebinds an existing `session.json` keyed by `planning_slug`, and returns the canonical absolute `planning_folder_path`. Variables are restored automatically by the server on resume — there is no agent-side restore step.

**Steps:** (2)

| # | Step | Binds | Condition |
|---|------|-------|-----------|
| 1 | `derive-planning-slug` | `version-control::initialize-folder` → binds `client_planning_slug` | `is_resuming == false` |
| 2 | `start-or-resume-session` | `workflow-engine::create-session(parent_session_index, workflow_id, planning_slug)` → binds `client_session_index` and the server-resolved `planning_folder_path` | — |

`derive-planning-slug` does NOT create a folder — the server owns folder creation under its workspace `.engineering` root. On resume the slug is preserved from saved state.

**Supporting techniques:** `version-control::initialize-folder`, `workflow-engine::create-session`.

**Transitions:** Default to [Resolve Target](#02-resolve-target).

---

### 02. Resolve Target

**Purpose:** Detect the target repository structure (regular vs. submodule monorepo) and resolve `target_path`.

**Entry actions:** `log: "Resolving target repository structure"`.

**Steps:** (3)

| # | Step | Binds | Condition |
|---|------|-------|-----------|
| 1 | `detect-monorepo` | `version-control::detect-repo-type` | — |
| 2 | `list-submodules` | `version-control::list-submodules` | `is_monorepo == true` |
| 3 | `capture-submodule-target` | prose — ask the user to select a submodule from the listed entries; set `target_path` to the chosen path | `is_monorepo == true` |

**Supporting techniques:** `version-control::detect-repo-type`, `version-control::list-submodules`.

**Rule:** `target_path` MUST resolve to a directory containing a working git tree.

**Checkpoints:** (1)

- `repo-type-confirmed` — confirm regular vs. monorepo (regular sets `is_monorepo = false`, `target_path = "."`; monorepo sets `is_monorepo = true`)

**Transitions:** Default to [Dispatch Client Workflow](#03-dispatch-client-workflow).

---

### 03. Dispatch Client Workflow

**Purpose:** Drive the client workflow's activity loop inline. The orchestrator dispatches each activity to a worker, mediates any yielded checkpoint with the user, commits and persists completed-activity artifacts, then evaluates the transition table to advance — repeating until `current_activity == null`.

**Entry actions:** `validate` `client_session_index` is set ("Cannot dispatch without a client session_index; initialize-session must run first").

**Steps:** (1)

| # | Step | Binds |
|---|------|-------|
| 1 | `prime-initial-activity` | prose — determine the first activity to dispatch |

**Loop:** `client-activity-loop` — `while` (`condition: current_activity != null`, `maxIterations: 200`)

| # | Loop step | Binds | Condition |
|---|-----------|-------|-----------|
| 1 | `dispatch-activity` | `workflow-engine::dispatch-activity(activity_id, session_index, prompt_template: meta/activity-worker-prompt, state)` | — |
| 2 | `present-yielded-checkpoint` | `workflow-engine::present-checkpoint-to-user(session_index)` | `worker_yielded_checkpoint == true` |
| 3 | `respond-yielded-checkpoint` | `workflow-engine::respond-checkpoint(session_index, resolution)` | `worker_yielded_checkpoint == true` |
| 4 | `commit-activity-artifacts` | `workflow-engine::commit-and-persist(activity_id, planning_folder_path, target_path)` | `worker_yielded_checkpoint == false` |
| 5 | `advance-activity` | `workflow-engine::evaluate-transition(activity, state, transition_override)` | `worker_yielded_checkpoint == false` |

**Supporting techniques:** `workflow-engine::dispatch-activity`, `evaluate-transition`, `commit-and-persist`, `present-checkpoint-to-user`, `respond-checkpoint`.

**Rule:** Authenticate every tool call inside the loop with `client_session_index`. The meta `session_index` is used only at activity boundaries (commit-and-persist's engineering commit) and at end-workflow.

**Transitions:** To [End Workflow](#04-end-workflow) when `current_activity == null`.

---

### 04. End Workflow

**Purpose:** Close out the client workflow — verify its outcomes, generate a session summary, and confirm closure. The final state is already durably persisted by the server on every authenticated tool call; no agent-side persist step is required. If the user opts to return to the workflow, transitions back to dispatch with `abort_completion = true`.

**Steps:** (2)

| # | Step | Binds |
|---|------|-------|
| 1 | `verify-outcomes` | `workflow-engine::verify-outcomes(outcome, state)` |
| 2 | `generate-summary` | `workflow-engine::generate-summary(workflow, trace)` |

**Supporting techniques:** `workflow-engine::verify-outcomes`, `generate-summary`.

**Checkpoints:** (1)

- `completion-confirmed` — confirm closure (`abort_completion = false`) or return to workflow (sets `abort_completion = true`, `client_workflow_completed = false`; `transitionTo: dispatch-client-workflow`)

**Exit actions:** `log: "Workflow session closed"`.

**Transitions:** Terminal under `confirm`. Returns to [Dispatch Client Workflow](#03-dispatch-client-workflow) under `return`.
