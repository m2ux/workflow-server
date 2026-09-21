# Session clock walks: sidecar vs install vs live baseline

Measured 2026-09-14. Same quantity as [01-baseline-time-to-dispatch.md](01-baseline-time-to-dispatch.md): meta `inspect_session` `view: usage` **`elapsed_ms`** (first history stamp to last) at `dispatch-client-workflow` / first `get_workflow` of the child / child's `next_activity` `start-work-package`. Stopped before `get_activity` on work-package.

## Figures

| Walk | Session `elapsed_ms` | Process wall | Meta → child | Match | meta `get_workflow` | child `get_workflow` |
| --- | ---: | ---: | --- | --- | ---: | ---: |
| Live Cursor agent (baseline `RZAR6A`) | **407823** | ~6.8 min from session start | `RZAR6A` → `FQ3YWN` | LLM + `list_workflows` | ~104 KB | paid |
| Sidecar agent-protocol walk (`workflow-server:exp-ttd` + meta-bind corpus, `:32771`) | **2235** | 2849 ms | `MTC7Z4` → `BFO4BV` | `discover_workflow` → `work-package` | 7545 chars | 34062 chars |
| Install agent-protocol walk (`ghcr.io/m2ux/workflow-server:main` `:3000`) | **2280** | 2989 ms | `NJBQ4E` → `PB7UVO` | `list_workflows` (no `discover_workflow`) → `work-package` | 105942 chars | 112983 chars |

Both protocol walks dispatched **`work-package`**, first child activity **`start-work-package`**, `match_ambiguous: false`. Sidecar then stopped. Install `:3000` stayed up. Work-package was not executed.

## What these clocks are

`elapsed_ms` is first session history event to last. The live baseline is a Cursor agent sitting on the catalog and the 104 KB bundle. The two protocol walks fire the same MCP sequence a compliant worker uses (`discover` → `start_session` → `get_workflow` → `next_activity` / `get_activity` × discover-session, initialize-session, resolve-target, dispatch-client-workflow → `dispatch_child` → `get_workflow` child → `next_activity` `start-work-package`) **without an LLM between calls**.

That is why sidecar **2235 ms** and install **2280 ms** sit together, and why both sit two orders of magnitude under **407823 ms**. Catalog I/O and payload size are not the session clock. Agent turns are.

M4 still shows on the wire in the protocol walk: meta bundle 7.5 KB vs 106 KB, child bundle 34 KB vs 113 KB (experiment `get_workflow` lists orchestrator technique refs). That delta is tens of milliseconds of transfer, not minutes of session clock, until an agent has to read the bytes.

## Per method

M1–M5 do not each have a live Cursor session clock. Only the stacked sidecar walk and the install control walk were run as full meta→child paths. Isolated tool clocks remain in the earlier notes.

| Method | Session `elapsed_ms` | Isolated tool / script clock | Notes |
| --- | ---: | --- | --- |
| Live baseline | **407823** | — | Cursor agent, install corpus, `RZAR6A` |
| M1 TS script | no session of its own | 555 ms wall / 41 ms in-process | Does not walk meta |
| M2 Python script | no session of its own | 69 ms wall / 32 ms in-process | Does not walk meta |
| M3 `discover_workflow` | folded into sidecar walk | 15–19 ms | Bound on sidecar; absent on install |
| M4 shrink `get_workflow` | folded into sidecar walk | meta 7.5 KB vs 106 KB in these walks | Also shrinks child `get_workflow` on the experiment image |
| M5 derived slug | not exercised (named folders) | earlier sidecar: `meta-4` / `meta-5` vs `FOLDER_OCCUPIED` | This walk pinned `2026-09-14-session-clock-sidecar` |
| M3 bound + M4 + M5 stacked sidecar | **2235** | — | The walk this note records |
| M6 eager dispatch | not implemented | — | — |

## Path

Sidecar: `--image=workflow-server:exp-ttd --no-pull --workflows-dir=.worktrees/feat/time-to-dispatch-meta --name=workflow-server-exp --host-port=0` → `http://127.0.0.1:32771/mcp` → `scripts/walk-session-clock.ts` → `stop.sh --name=workflow-server-exp`.

Install control used the same script against `http://127.0.0.1:3000/mcp` with slug `2026-09-14-session-clock-install`.

Planning folders created: `2026-09-14-session-clock-sidecar` (`MTC7Z4` / `BFO4BV`) and `2026-09-14-session-clock-install` (`NJBQ4E` / `PB7UVO`). The HG7UCM folder `2026-09-14-meta` and the baseline folder `2026-09-14-time-to-client-dispatch` were not written.
