# M1: TypeScript scripted discovery

Measured 2026-09-14 on worktree `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment` (branch `feat/time-to-dispatch-experiment`, tree based at `fe5f5f78`; matcher and CLI uncommitted at measurement). Same `user_request` as [01-baseline-time-to-dispatch.md](./01-baseline-time-to-dispatch.md).

## Result

| Clock | Value |
| --- | --- |
| In-process load + rank (3 runs) | 70.3 ms, 57.2 ms, 53.7 ms |
| Process wall (`npx tsx scripts/discover-workflow.ts`) | 0.69 s, 0.68 s, 0.66 s |
| Selected `workflow_id` | `work-package` |
| `ambiguous` | false |
| Catalog size | 17 (meta excluded, same as `list_workflows`) |
| Session clock (`elapsed_ms` at client dispatch) | not re-walked this turn |

Correctness: top match is `work-package`, matching the baseline agent. Second is `remediate-vuln` (score 8 vs 10) — below the 0.85 ambiguity ratio.

## Path taken

`loadDiscoveryCatalog` (corpus walk + parse of each `workflow.yaml` for id, title, version, tags, description) → `rankWorkflows`. Did not call MCP `list_workflows`. Description is scored here; the MCP list payload does not include it.

## What this number is

The baseline session clock is **407823 ms**. Discover-session on that walk was an LLM worker: spawn, `get_activity` delivery, `list_workflows`, in-context keyword match. M1's 0.66 s wall is that catalog+match slice with the LLM removed.

M1 does not by itself lower the session clock: meta still runs `discover-session` unless a later method (M3 as a tool the activity binds, or M6 collapsing setup) stops paying that worker. The hypothesis that catalog I/O dominates discover-session is false; the agent loop dominates. The matcher is fast enough to sit behind an MCP tool (M3) without a measurable I/O penalty.

## How to run

From the experiment worktree:

```
npm run discover:workflow -- --query="<user request>"
```

`WORKFLOWS_DIR` overrides the shared `.worktrees/workflows` dest. Exit 0 on a unique match, 3 when scores are close, 4 when nothing scores.

Tests: `npx vitest run tests/match-workflow.test.ts` (6 passed, including a live-corpus check that the baseline request selects `work-package`).
