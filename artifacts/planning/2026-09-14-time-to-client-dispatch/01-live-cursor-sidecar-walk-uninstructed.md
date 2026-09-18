# Live Cursor sidecar walk (uninstructed)

Timed live walk of meta on the experiment sidecar, in this Cursor chat, from first tool call to the child’s first `next_activity`. The parent followed the meta operations bundle (spawn a worker; do not `get_activity` from the orchestrator). No canned HTTP harness (`scripts/walk-session-clock.ts` was not used). Docker was left alone.

## Clocks

| Mark | UTC |
| --- | --- |
| This prompt | 2026-09-14T11:05:00Z (12:05 local, UTC+1) |
| Meta `start_session` / `startedAt` | 2026-09-14T11:06:03.188Z |
| Child creation (`workflow_triggered` / child `startedAt`) | 2026-09-14T11:11:38.104Z / 2026-09-14T11:11:38.105Z |
| Stop (child `next_activity` `start-work-package` / `activity_entered`) | 2026-09-14T11:11:47.333Z |

Primary clock — meta `inspect_session` `view: usage` **`elapsed_ms`: 334916**. That span is the first meta history stamp (`workflow_started` at 2026-09-14T11:06:03.188Z) to the last meta history stamp (`workflow_triggered` at 2026-09-14T11:11:38.104Z). The child’s `next_activity` sits on the child session and does not extend this figure.

Child `inspect_session` `view: usage` **`elapsed_ms`: 9228** (`workflow_started` 2026-09-14T11:11:38.105Z to `activity_entered` `start-work-package` 2026-09-14T11:11:47.333Z).

Usage rows: none. `activities_without_usage`: `discover-session`. Harness surfaced no token figures, so `record_usage` was omitted.

## Sessions

| | |
| --- | --- |
| Meta `session_index` | `MU5VDE` |
| Child `session_index` | `POPHZR` |
| Planning slug actually used | `2026-09-14-meta-7` |
| Planning folder | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-14-meta-7` |
| Worker `agent_id` | `w-MU5VDE-discover-1` |

`start_session` omitted `planning_folder`. The dated slug `2026-09-14-meta` through `2026-09-14-meta-6` were already occupied. The same call allocated the next free folder **`2026-09-14-meta-7`**.

`initialize-session` derived initiative slug `2026-09-14-time-to-client-dispatch` and then `dispatch_child` without a `planning_folder`, so the child bound to the parent’s `2026-09-14-meta-7` folder rather than opening that derived name. Meta frontier after stop: `initialize-session` still current (`resolve-target` and `dispatch-client-workflow` were not entered).

## Child and match

| | |
| --- | --- |
| Child `workflow_id` | `work-package` |
| Child `initialActivity` | `start-work-package` |
| `discover_workflow` called | yes |
| `discover_workflow` `workflow_id` | `work-package` |
| `list_workflows` called | no |
| Child `get_workflow` called | no |
| Child `get_activity` called | no |

Matching used `discover_workflow` only. `list_workflows` was not called. The child was created from `initialize-session` via `dispatch_child`, then `next_activity` `start-work-package` on `POPHZR`.

## Payloads and MCP

| | |
| --- | --- |
| Meta `get_workflow` shape | compact operations index (technique refs, then metadata) |
| Child `get_workflow` | not fetched |
| MCP namespace used | `user-workflow-server-exp` |
| MCP URL | `http://127.0.0.1:32772/mcp` |

The install instance on `:3000` (`workflow-server`) was not called.

## Tool path (order)

Parent (orchestrator, this chat):

1. `discover` (after schema lookup on `user-workflow-server-exp`)
2. `start_session` (`workflow_id: meta`, `agent_id: orchestrator`, `working_directory: /home/mike1/projects/dev/workflow-server`, `user_request` verbatim, no `planning_folder`) → `MU5VDE`, slug `2026-09-14-meta-7`
3. `get_workflow` (meta `MU5VDE`)
4. `next_activity` `discover-session`
5. `get_technique` `orchestrator-conduct`
6. `get_technique` `workflow-engine::dispatch-activity`
7. `get_technique` `workflow-engine::compose-prompt`
8. `get_technique` `harness-compat::spawn-agent`
9. `get_technique` `harness-compat::cursor`
10. `get_technique` `harness-compat::claude-code`
11. Host `Task` spawn worker `w-MU5VDE-discover-1` (`run_in_background=false`, `subagent_type=generalPurpose`)
12. `get_technique` `workflow-engine::continue-batch`
13. `next_activity` `initialize-session` with `from_activity: discover-session`, `exit: done`, `variables_changed` from the worker envelope, `agent_id: w-MU5VDE-discover-1`
14. Host `Task` resume same worker
15. `inspect_session` on meta (`usage`, then `identity`, `children`, `history`, `activities`) and on child `POPHZR` (`identity`, `usage`, `history`)

Worker (`w-MU5VDE-discover-1`):

1. `get_activity` (discover-session; `context_tokens: 200000`; full delivery)
2. `inspect_session` `variables` / `identity` / `summary`
3. Host git (`rev-parse --show-toplevel`, `remote get-url origin`) for `resolve-host-repo`
4. `discover_workflow` (query = the user request) → `work-package`
5. `get_resource` `meta/resume-intent-lexicon` — `resume_intent_requested` false; saved-session scan skipped
6. Host grep/glob/read under the repo and workflows worktree while composing the envelope
7. `get_technique` `workflow-engine::evaluate-transition`
8. Return `activity_complete` (`next_activity_id: initialize-session`, `activity_exit: done`)
9. `get_activity` (initialize-session; `bundle: "reference"`)
10. `inspect_session` `variables` / `identity` / `children`
11. `dispatch_child` `workflow_id: work-package` → `POPHZR`
12. `next_activity` `start-work-package` on `POPHZR`

## Stop confirmation

The child session exists and its first activity has been entered. This walk did **not** call `get_activity` on the client workflow. It did not dispatch a worker for `start-work-package`. It did not enter `resolve-target`, `dispatch-client-workflow`, or any work-package activity body.

Docker was left running.
