# Meta graph sidecar walk (computed bag)

HTTP MCP walk of meta **7.0.0** against the experiment sidecar. The question is whether the cut graph still loads and advances: `dispatch-client-workflow` → `end-workflow`. This is not a live Cursor clock and it is not work-package delivery.

Install `workflow-server` on `:3000` (`ghcr.io/m2ux/workflow-server:main`) stayed up. The sidecar was rebuilt onto a **new** image tag so the earlier `workflow-server:exp-ttd` M3/M6 image was not overwritten.

## Sidecar

| | |
| --- | --- |
| Container | `workflow-server-exp` |
| Image | `workflow-server:exp-computed-bag` |
| MCP URL | `http://127.0.0.1:32772/mcp` |
| Engine build | `.worktrees/feat/start-session-computed-bag` (PR #720) |
| Corpus mount | `.worktrees/feat/start-session-computed-bag-meta` (PR #721) |
| Ready | `sessionKeyWritable=true` |

Reload (from `feat/time-to-dispatch-experiment/scripts/reload-exp-sidecar.sh`):

```bash
./scripts/reload-exp-sidecar.sh \
  --name=workflow-server-exp \
  --image=workflow-server:exp-computed-bag \
  --build=/home/mike1/projects/dev/workflow-server/.worktrees/feat/start-session-computed-bag \
  --workflows-dir=/home/mike1/projects/dev/workflow-server/.worktrees/feat/start-session-computed-bag-meta \
  --host-port=32772
```

`tools/list` on this sidecar: 18 tools. `discover_workflow` is absent. `start_session` is present. `health_check` reported `workflows_available: 17`, server version `2.1.0`.

## Walk 1 — empty meta (CI shape)

`start_session({ workflow_id: "meta", agent_id: "e2e-walker" })` with no `user_request` and no `working_directory`. That is the e2e walker contract (`tests/e2e/walker.ts`): transient meta, no client embed.

| Call | ms | Result |
| --- | --- | --- |
| `start_session` | 81.1 | `session_index` `VEZMIH`; workflow `meta` **7.0.0**; `client` null |
| `get_workflow` | 94.7 | `initialActivity: dispatch-client-workflow`; activities `dispatch-client-workflow`, `end-workflow`; 103444 chars |
| `next_activity` `dispatch-client-workflow` | 17.4 | entered; validation `valid` |
| `get_activity` `dispatch-client-workflow` | 64.6 | id matches; 41862 chars |
| `next_activity` `end-workflow` (`from_activity` dispatch, `exit` `"null"`, `current_activity: null`) | 18.4 | entered |
| `get_activity` `end-workflow` | 69.9 | checkpoint `completion-confirmed` present |
| `get_workflow_status` | 15.2 | `in_flight: [end-workflow]`; completed `dispatch-client-workflow` |

Path: **dispatch-client-workflow → end-workflow**. `discover-session` is not in the served graph.

The robot walker applies `set` actions and does not run `validate`. Empty `client_session_index` therefore does not fail this walk. A live agent that executes the validate step on this transient session still hits `Cannot dispatch without a client session_index; start_session must have opened the client`. Corpus CI `mode: 'graph'` is the load-and-advance check; this walk is that check on the sidecar.

## Walk 2 — durable meta with client embed

Same sidecar. `start_session` with the baseline query, `working_directory` `/home/mike1/projects/dev/workflow-server`, `planning_folder` pin `2026-09-14-meta-graph-sidecar`, `fresh: true`.

| | |
| --- | --- |
| Meta `session_index` | `D63UUM` |
| Client `session_index` | `QFIOEG` |
| Client workflow | `work-package` 4.1.0 |
| Client `initialActivity` | `start-work-package` |
| `start_session` | 264.7 ms; outcome **client**, no `decision` |
| Meta `get_workflow` | 7.0.0, `initialActivity: dispatch-client-workflow` |
| Meta `next_activity` / `get_activity` dispatch | entered; activity id matches |
| Child `get_workflow` / `next_activity` | `start-work-package` entered |
| Meta `inspect_session` `view: usage` **`elapsed_ms`** | **718** |

The 718 ms figure is server session span after a scripted HTTP walk, not sitting-through-the-preamble time. Unique match opened `work-package` inside `start_session`. Meta then entered `dispatch-client-workflow` with a seeded client index.

## What this settles

1. Meta **7.0.0** loads on the live HTTP server, not only in-process vitest.
2. The two-activity graph advances: dispatch then end.
3. `end-workflow` still carries `completion-confirmed`.
4. The product path still opens a child (`work-package`) and lets the caller enter the child's first activity.
5. Engine #720 plus corpus #721 is the image+mount that produced this. Merge order remains engine first.

Walks did not re-record `walks/snapshot.test.ts.snap` or `walks/corpus-sha.json`. They did not execute dispatch `validate` on the empty session. They did not walk work-package past `start-work-package`.
