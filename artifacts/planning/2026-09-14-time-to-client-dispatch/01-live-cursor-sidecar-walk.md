# Live Cursor treatment walk (experiment sidecar)

Timed live walk of meta on the experiment sidecar, in this Cursor chat, from first tool call to the child’s first `next_activity`. The agent followed meta for real. No canned HTTP harness (`scripts/walk-session-clock.ts` was not used).

## Clocks

| Mark | UTC |
| --- | --- |
| This prompt | 2026-09-14T11:00:00Z (12:00 local, UTC+1) |
| Meta `start_session` / `startedAt` | 2026-09-14T11:00:23.567Z |
| Child creation (`workflow_triggered` / child `startedAt`) | 2026-09-14T11:01:26.717Z |
| Stop (child `next_activity` `start-work-package`) | 2026-09-14T11:02:01.494Z |

Primary clock — meta `inspect_session` `view: usage` **`elapsed_ms`: 86581**. That span is the first meta history stamp (`workflow_started` at 2026-09-14T11:00:23.567Z) to the last meta history stamp (`get_activity` on `dispatch-client-workflow` at 2026-09-14T11:01:50.148Z). The child’s `get_workflow` and `next_activity` sit on the child session and do not extend this figure.

Secondary wall (this prompt to the stop line) is about 121 seconds. This prompt is longer than the baseline’s first prompt, so `elapsed_ms` is the comparator, not prompt-clock.

## Sessions

| | |
| --- | --- |
| Meta `session_index` | `ZA4H56` |
| Child `session_index` | `6X5X65` |
| Planning slug actually used | `2026-09-14-meta-6` |
| Planning folder | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-14-meta-6` |

`start_session` omitted `planning_folder`. The dated slug `2026-09-14-meta` was already occupied (`2026-09-14-meta` through `2026-09-14-meta-5` exist). The same call allocated the next free folder **`2026-09-14-meta-6`**.

## Child and match

| | |
| --- | --- |
| Child `workflow_id` | `work-package` |
| Child `initialActivity` | `start-work-package` |
| `discover_workflow` called | yes |
| `discover_workflow` `workflow_id` | `work-package` |
| `discover_workflow` `ambiguous` | false |
| `list_workflows` called | no |

The dispatched child id equals the `discover_workflow` return (`work-package` / `work-package`). Matching used `discover_workflow` only. `list_workflows` was not called.

## Payloads and MCP

| | |
| --- | --- |
| Meta `get_workflow` size | **7530 characters** (served body: technique refs, then metadata; not the ~100 KB stock bundle) |
| MCP namespace used | `user-workflow-server-exp` |
| MCP URL | `http://127.0.0.1:32772/mcp` |

Gates held: `discover_workflow` is present on this namespace; meta `get_workflow` is a compact operations index; `discover-session` / `match-target-workflow` names `discover_workflow` and has no list-available-workflows step.

The install instance on `:3000` (`workflow-server`) was not called.

## Tool path (order)

1. `discover`
2. `start_session` (`workflow_id: meta`, `agent_id: orchestrator`, `working_directory: /home/mike1/projects/dev/workflow-server`, `user_request` verbatim, no `planning_folder`)
3. `get_workflow` (meta `ZA4H56`)
4. `next_activity` `discover-session`
5. `get_activity` (bundle paid; `context_tokens: 128000`)
6. Host derivation via git (`version-control::resolve-host-repo`): `host_repo_path` `/home/mike1/projects/dev/workflow-server`, `target_repo` `m2ux/workflow-server`, `host_binding_mismatch` false
7. `discover_workflow` (query = the user request)
8. `get_resource` `meta/resume-intent-lexicon` — `resume_intent_requested` false; saved-session scan skipped
9. `next_activity` `initialize-session` with `variables_changed` from that work
10. `get_activity`
11. `dispatch_child` `workflow_id: work-package`
12. `next_activity` `resolve-target`
13. `get_activity` — `.engineering` is infrastructure; `is_monorepo` false; `component_path` `.`
14. `next_activity` `dispatch-client-workflow`
15. `get_activity`
16. `get_workflow` (child `6X5X65`)
17. `next_activity` `start-work-package` on the child
18. `inspect_session` on meta (`usage`, `identity`, `children`, `history`)

## Stop confirmation

The child session exists and its first activity has been entered. This walk did **not** call `get_activity` on the client workflow. It did not dispatch a worker for `start-work-package`. It did not enter `design-philosophy` or any later work-package activity.

Both Docker containers were left running.
