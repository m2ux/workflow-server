# M3: `discover_workflow` MCP tool

Measured 2026-09-14 on worktree `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment` (branch `feat/time-to-dispatch-experiment`, tree based at `fe5f5f78`; tool uncommitted at measurement). Same `user_request` as [01-baseline-time-to-dispatch.md](./01-baseline-time-to-dispatch.md). Companions: [01-m1-scripted-discovery.md](./01-m1-scripted-discovery.md), [01-m2-scripted-discovery.md](./01-m2-scripted-discovery.md).

## Blast radius

GitNexus `impact` on `registerWorkflowTools` (upstream) returned **HIGH**: 2 direct callers (`createServer`, `captureTools`), 4 processes, 3 modules. The edit is additive — one new unauthenticated tool — and does not change existing handler signatures. Direct callers enumerate tools dynamically; tests that snapshot the registered name set were updated.

## Result

In-memory MCP harness (warmup discarded), three timed calls each:

| Clock / payload | `discover_workflow` | `list_workflows` (same harness) | M1 `npx tsx` CLI |
| --- | --- | --- | --- |
| Call duration (3 runs) | **13.5 ms, 13.8 ms, 13.9 ms** | 24.3 ms, 23.0 ms, 21.7 ms | 0.66–0.69 s wall |
| Response chars | **436** | 3294 | full ranked catalog |
| Selected `workflow_id` | `work-package` | n/a (full list) | `work-package` |
| `ambiguous` | false | n/a | false |
| Ranked rows on the wire | 5 (ids + scores + titles; no tags) | 17 entries with tags | all scored |
| Session clock | not re-walked | — | not re-walked |

Correctness: same top match as M1/M2 and the baseline agent. Integration tests: unique match on the baseline request, missing `query` refused, tool listed in the registered surface, unauthenticated calls leave the session trace unchanged.

## Path taken

Agent supplies `query` → `loadDiscoveryCatalog` (same corpus walk as M1) → `rankWorkflows` → `presentDiscoverWorkflow` (top five positive scores). No session. The catalog is not in the response.

Call: `discover_workflow` with `{ query: "<user request>" }`.

## What this number is

The matcher behind an MCP tool is as cheap as M1 in-process (~14 ms) and ships **7.5× fewer characters** than `list_workflows`. That is the product-shaped control M1/M2 asked for: an agent can rank without a shell script and without stuffing the catalog into context.

It still does not move the **407823 ms** session clock. Live meta still pays discover-session as an LLM worker (`list_workflows` + in-context match) unless a later method binds this tool (M6 collapsing setup, or a corpus change that names `discover_workflow` on that activity). M3 is the surface those methods would call.

## How to run

From the experiment worktree, against a server built from this tree:

```
discover_workflow  query="<user request>"
```

Timing harness (in-memory transport, not stdio): `tsx scripts/time-discover-workflow-mcp.ts`.
