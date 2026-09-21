# M2: Python scripted discovery

Measured 2026-09-14 on worktree `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment` (branch `feat/time-to-dispatch-experiment`, tree based at `fe5f5f78`; Python CLI uncommitted at measurement). Same `user_request` as [01-baseline-time-to-dispatch.md](./01-baseline-time-to-dispatch.md). Companion: [01-m1-scripted-discovery.md](./01-m1-scripted-discovery.md).

## Result

| Clock | M2 (Python) | M1 (TypeScript) |
| --- | --- | --- |
| In-process load + rank (3 runs) | 34.7 ms, 38.4 ms, 39.9 ms | 70.3 ms, 57.2 ms, 53.7 ms |
| Process wall | **0.07 s**, 0.07 s, 0.07 s | 0.69 s, 0.68 s, 0.66 s |
| Selected `workflow_id` | `work-package` | `work-package` |
| `ambiguous` | false | false |
| Catalog size | 17 | 17 |
| Score of top match | 10.0 | 10 |
| Session clock | not re-walked | not re-walked |

Correctness: same top match and same non-ambiguous ranking as M1 on the baseline request. Six Python unit tests passed, including the live-corpus check.

## Path taken

`load_discovery_catalog` (directory walk matching the engine's reserved-name / `corpus/` rules, PyYAML parse of each `workflow.yaml`) → `rank_workflows`. Did not call MCP `list_workflows`. Did not import the TypeScript matcher.

PyYAML 6.0.2 was already on the host; it is not a new package in this repo.

## What this number is

M1's extra ~0.6 s of process wall is Node/`tsx` startup, not corpus I/O. In-process, both languages load and rank in tens of milliseconds. Neither approaches the **407823 ms** baseline session clock.

The M2 hypothesis holds: the bottleneck is the agent loop, not the language. Python is the cheaper *script* to invoke from a shell; it is not a product surface an MCP agent can call without a wrapper. The matcher is still cheap enough to sit behind M3.

## How to run

From the experiment worktree:

```
npm run discover:workflow:py -- --query="<user request>"
```

or `python3 scripts/discover_workflow.py --query="..."`. `WORKFLOWS_DIR` overrides the shared `.worktrees/workflows` dest. Exit codes match M1: 0 unique match, 3 close scores, 4 no match.

Tests: `python3 tests/test_discover_workflow.py`.
