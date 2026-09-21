# M4: shrink meta `get_workflow`

Measured 2026-09-14 on worktree `/home/mike1/projects/dev/workflow-server/.worktrees/feat/time-to-dispatch-experiment` (branch `feat/time-to-dispatch-experiment`, tree based at `fe5f5f78`; change uncommitted at measurement). Same `user_request` as [01-baseline-time-to-dispatch.md](./01-baseline-time-to-dispatch.md).

## Blast radius

GitNexus `impact` on `registerWorkflowTools` and `registerResourceTools` (upstream) returned **HIGH** (each: `createServer` + `captureTools`). `formatTechniqueBundle` was **CRITICAL** and was not edited — `get_activity` still inlines worker bodies through it. The get_workflow handler stopped calling `resolveTechniques` for the orchestrator index; `get_technique` gained a named `technique` parameter.

## Result

In-memory harness, first `get_workflow` after `start_session`:

| Payload | Before | After |
| --- | --- | --- |
| Meta `get_workflow` | **105,904** chars (ops 100,151 + summary 5,746) | **7,507** chars (index 1,754 + summary 5,746) |
| Work-package `get_workflow` | 112,934 chars (ops 80,361 + summary 32,566) | 34,013 chars (index 1,440 + summary 32,566) |
| Bootstrap fixed content (discover + start_session + get_workflow) | ~112k budget, ~106k get_workflow | **10,199** (discover 2,316, start_session 376, get_workflow 7,507) |
| `dispatch_child` (child `initialActivity`) | 293 chars, already present | 293 chars, unchanged |
| Session clock | 407,823 ms | not re-walked |

Correctness: `dispatch_child` still carries the child's `initialActivity`, so meta does not load the work-package bundle to dispatch. Named `get_technique({ technique: "workflow-engine::dispatch-activity" })` returns the composed body on a work-package session with no activity in flight. Bootstrap budget locked at **15,000** characters.

## Path taken

`get_workflow` lists the union of `techniques.workflow`, `CORE_ORCHESTRATOR_TECHNIQUES`, and fan refs when the graph fans — each as `{ ref }`. Composed bodies are not in that response. `get_technique` loads a named ref. Child dispatch stays on `dispatch_child`.

The fattest entries in the old meta ops block were `dispatch-activity` (6,048), `continue-batch` (4,593), `commit-and-persist` (4,579) — not the harness adapters (~200 chars each). Listing refs removes that class of cost in one cut.

## What this number is

The baseline 104KB was meta's first `get_workflow`, almost all orchestrator technique bodies. That call is now 7.5KB. An agent that still follows bootstrap and calls `get_workflow` reads ~14× less before the first decision.

Session clock is unchanged until a live meta walk uses this server: the remaining minutes are still agent turns (discover-session worker, keyword match unless M3 is bound). This method cuts bytes on the live path; it does not remove those turns.

Work-package's remaining 32KB is summary (graph + variables), not ops — out of scope for meta time-to-dispatch.

## How to run

`get_workflow` with `{ session_index }`. Load a body: `get_technique` with `{ session_index, technique: "workflow-engine::dispatch-activity" }`. Payload harness: `tsx scripts/time-get-workflow-payload.ts`.
