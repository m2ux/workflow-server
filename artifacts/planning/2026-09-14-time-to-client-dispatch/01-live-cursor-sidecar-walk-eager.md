# Live Cursor treatment walk (experiment sidecar, eager dispatch)

Timed live walk of meta on the experiment sidecar, in this Cursor chat, from first tool call to the child’s first `next_activity`. The agent followed the sidecar bootstrap: `start_session` returned `client.session_index`, so the opening path loaded the child rather than entering meta `discover-session`. No canned HTTP harness (`scripts/walk-session-clock.ts` was not used).

The path named in the prompt, `01-live-cursor-sidecar-walk.md`, already holds the earlier full-meta walk (`ZA4H56` / `6X5X65`, `elapsed_ms` 86581). This file records this run so that note is not overwritten.

## Clocks

| Mark | UTC |
| --- | --- |
| This prompt | 2026-09-14T11:34:00Z (12:34 local, UTC+1) |
| Meta `start_session` / `startedAt` | 2026-09-14T11:35:25.326Z |
| Child creation (`workflow_triggered` / child `startedAt`) | 2026-09-14T11:35:25.409Z / 2026-09-14T11:35:25.410Z |
| Stop (child `next_activity` `start-work-package` / `activity_entered`) | 2026-09-14T11:35:56.748Z |

Primary clock — meta `inspect_session` `view: usage` **`elapsed_ms`: 83**. That span is the first meta history stamp (`workflow_started` at 2026-09-14T11:35:25.326Z) to the last meta history stamp (`workflow_triggered` at 2026-09-14T11:35:25.409Z). The child’s `get_workflow` and `next_activity` sit on the child session and do not extend this figure.

Secondary wall (this prompt to the stop line) is about 117 seconds. This prompt is longer than the baseline’s first prompt, so `elapsed_ms` is the comparator, not prompt-clock.

## Sessions

| | |
| --- | --- |
| Meta `session_index` | `OPH6L7` |
| Child `session_index` | `JE2NSB` |
| Planning slug actually used | `2026-09-14-meta-8` |
| Planning folder | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-14-meta-8` |

`start_session` omitted `planning_folder`. The dated slug `2026-09-14-meta` was already occupied (`2026-09-14-meta` through `2026-09-14-meta-7` exist). The same call allocated the next free folder **`2026-09-14-meta-8`**.

`start_session` also returned `client.session_index` `JE2NSB`, `client.workflow.id` `work-package`, `client.workflow.initialActivity` `start-work-package`. Meta frontier after that call was empty; the meta activities were not entered.

## Child and match

| | |
| --- | --- |
| Child `workflow_id` | `work-package` |
| Child `initialActivity` | `start-work-package` |
| `discover_workflow` called | yes |
| `discover_workflow` `workflow_id` | `work-package` |
| `discover_workflow` `ambiguous` | false |
| `list_workflows` called | no |

The dispatched child id equals the `discover_workflow` return (`work-package` / `work-package`). Matching used `discover_workflow` (gate call before `start_session`; the same unique match is what `start_session` dispatched). `list_workflows` was not called. Baseline `RZAR6A` also dispatched `work-package`.

## Payloads and MCP

| | |
| --- | --- |
| Meta `get_workflow` size | compact technique-ref index (same shape as the 7530-character sidecar body; not the ~100 KB stock bundle). Fetched after the stop-line usage inspect, so this call is not in `elapsed_ms`. |
| MCP namespace used | `user-workflow-server-exp` |
| MCP URL | `http://127.0.0.1:32772/mcp` |

Gates held: `discover_workflow` is present on this namespace; `start_session` returned `client`; meta `get_workflow` is a compact operations index. The install instance on `:3000` (`workflow-server`) was not called.

Because the client opened inside `start_session`, this walk did not call `get_activity` on `discover-session` and did not load `workflow-engine::match-target-workflow`. The match tool on the wire was `discover_workflow`.

## Tool path (order)

1. `discover` (`user-workflow-server-exp`)
2. `discover_workflow` (query = the user request; `work-package`, `ambiguous: false`)
3. `start_session` (`workflow_id: meta`, `agent_id: orchestrator`, `working_directory: /home/mike1/projects/dev/workflow-server`, `user_request` verbatim, no `planning_folder`) — response included `client.session_index` `JE2NSB`
4. `get_workflow` (child `JE2NSB`)
5. `next_activity` `start-work-package` on the child
6. `inspect_session` on meta (`usage`, `identity`, `children`, `history`)

`get_workflow` on meta `OPH6L7` ran after that usage inspect, for the payload-size gate only.

## Stop confirmation

The child session exists and its first activity has been entered. This walk did **not** call `get_activity` on the client workflow. It did not dispatch a worker for `start-work-package`. It did not enter `design-philosophy` or any later work-package activity.

Both Docker containers were left running.
