# M5: folder-collision avoidance

Measured 2026-09-14 on worktree `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment` (branch `feat/time-to-dispatch-experiment`, tree based at `fe5f5f78`; change uncommitted at measurement). Same `user_request` as [01-baseline-time-to-dispatch.md](./01-baseline-time-to-dispatch.md).

## Blast radius

GitNexus `impact` on `registerResourceTools` (upstream) returned **HIGH**: 2 direct callers (`createServer`, `captureTools`), 4 processes, 4 modules. The handler now calls `allocateDerivedPlanningSlug` before looking up a derived dated slug; named `planning_folder` resume and `dispatch_child` promote occupancy are unchanged. `allocateDerivedPlanningSlug` is new — the index on the primary checkout does not yet list it (`Target not found`). `findPlanningFolderBySlug` is only a callee.

## Result

In-memory harness, two derived `start_session` calls with the same `working_directory` (live corpus). Three independent harnesses:

| Clock / payload | First derived call | Occupied derived call (same day, same workflow) |
| --- | --- | --- |
| Call duration (3 runs) | 50.3 ms, 50.1 ms, 52.1 ms | **38.5 ms, 30.0 ms, 26.6 ms** |
| Response chars | 508 | 512 |
| `planning_slug` | `2026-09-14-meta` | `2026-09-14-meta-2` |
| Outcome | new session | **new session** (not a resume, not `FOLDER_OCCUPIED`) |
| Session clock | not re-walked | not re-walked |

Fixture suite (PR528-TC-05): second derived call succeeds, different `session_index`, first folder `session.json` / `.session-token` byte-identical, second folder created. PR528-TC-07 (`dispatch_child` onto a named occupied slug) still throws `FOLDER_OCCUPIED`.

Correctness: the occupying run is left alone. Named folders still resume. A derived start that collides opens `base-2` (then `base-3`, …) in the same call.

## Path taken

`working_directory` set, `planning_folder` omitted → `allocateDerivedPlanningSlug` walks `YYYY-MM-DD-<workflow_id>`, then `base-2` … `base-100`, treating a slug as taken only when `findPlanningFolderBySlug` finds a folder that already has `session.json`. The first free slug is created.

The baseline paid `FOLDER_OCCUPIED` on `2026-09-14-meta` (occupied by `HG7UCM`) and the agent retried with a distinct folder. That extra `start_session` round-trip is the collision this method removes.

## What this number is

Server time on the occupied call is **tens of milliseconds** — cheaper than the first call in the same harness because the workflow is already loaded. That is not the session-clock save.

The live quantity this method can cut is **one agent `start_session` error-and-retry turn**, and only when the dated slug is already taken. On a day with no occupying folder the path is identical to before. Session clock is still **407823 ms** until a live meta walk uses this server.

A request-derived slug would have avoided `HG7UCM` on the first call too; that is a second intervention and is out of this method.

## How to run

`start_session` with `{ workflow_id, agent_id, working_directory }` and no `planning_folder`. A second call the same day with the same arguments returns `planning_slug` `YYYY-MM-DD-<id>-2`.

Timing harness: `tsx scripts/time-start-session-occupied.ts`.
