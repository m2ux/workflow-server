# Codebase Comprehension — Workflow graph

> Parallel activities · 2026-09-09 · complete · coverage: graph schema, exit bindings, transition validation, session position, reachability walk, checkpoint exit payload at `d54f3562f2781e63201d17b0423de5e8b1ff08fa`

Settled facts live in the corpus artifact [workflow-graph.md](../../comprehension/workflow-graph.md). This file holds the questions, the walks that answered them, and the items left for design.

## Open Questions

All questions this pass opened were answered from the code. None carry forward as open.

| # | Question | Status | Resolution | Deep-Dive Section |
|---|----------|--------|------------|-------------------|
| 1 | Is a graph destination a single string? | Resolved | [GraphSchema](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L51) is `z.record(z.record(z.string()))` | Destination type |
| 2 | Where do the two routing halves meet? | Resolved | [getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) | Meeting point |
| 3 | What records what is in flight? | Resolved | [currentActivity](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/session.schema.ts#L96) is one string | Walk position |
| 4 | Is child-workflow dispatch the same as a graph fan? | Resolved | Children nest another session; each still has one currentActivity | Hierarchical grain |
| 5 | Who consumes ExitBinding.to as a scalar? | Resolved | Callers listed below; each treats `to` as one id | Caller set |

## Deep-Dive Sections

### Meeting point — 2026-09-09

[getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) maps each declared exit that the graph binds to an [ExitBinding](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L477) whose `to` is a string.

Query: GitNexus `context({name: "getExitBindings", file_path: "src/loaders/workflow-loader.ts"})` and `impact({target: "getExitBindings", direction: "upstream"})`. Risk CRITICAL; summary: 5 direct callers, 8 processes, 4 modules.

Caller set of getExitBindings (incoming CALLS from GitNexus context):

| Caller | File |
|--------|------|
| registerWorkflowTools | `src/tools/workflow-tools.ts` |
| validateReportedExit | `src/utils/validation.ts` |
| validateActivityManifest | `src/utils/validation.ts` |
| exitDestinations | `src/loaders/workflow-loader.ts` |
| workflow-loader.test.ts | `tests/workflow-loader.test.ts` |

Sites inside registerWorkflowTools (worktree grep `getExitBindings(` under `src/tools/workflow-tools.ts`):

| Line | Use |
|------|-----|
| 1431 | Project `exit_destinations` map exit → `to` |
| 1902 | Present-checkpoint: bindings for the active activity |
| 2085 | Respond-checkpoint: find binding whose exit is the chosen one |

`exitDestinations` is itself called by [validateActivityTransition](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/utils/validation.ts#L33). GitNexus `context` on validateActivityTransition listed only `tests/validation.test.ts` as incoming CALLS; the production call is inside registerWorkflowTools at [line 928](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/tools/workflow-tools.ts#L928) (worktree grep `validateActivityTransition(`). Impact places validateActivityTransition at depth 2 via exitDestinations.

[validateExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L520) compares each destination to the sentinel and to `knownActivityIds` as a string. [activityGraph](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/utils/activity-variables.ts#L540) builds `Map<string, string[]>` from `Object.values(workflow.graph[activityId])`, so every value in that map is already a string.

### Destination type — 2026-09-09

Read [GraphSchema](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L45-L51) and the Graph comment: activity id → exit id → destination activity id. No union, no array, no member object.

### Walk position — 2026-09-09

[currentActivity](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/session.schema.ts#L96) defaults to `''`. Advancing a session assigns [draft.currentActivity = activity_id](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/tools/workflow-tools.ts#L842). [WorkflowState](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/state.schema.ts#L182-L184) requires the field when status is running, paused, or suspended. Worktree grep of `src/` for `frontier` returns no session-position hit; `src/utils/fan-out.ts` measures technique-container fan-out, not graph fans.

### Hierarchical grain — 2026-09-09

[hierarchical-dispatch.md](../../comprehension/hierarchical-dispatch.md) records child sessions under `triggeredWorkflows[]`. Each child has its own currentActivity. That is nested walks, not several destinations of one exit.

## Challenge Lenses

Sequential scatter over `["pedagogy", "rejected-paths"]` (depth-1; no concurrent spawn). Combine prefers evidence-backed `resolved-by-challenge` over bare `confirmed`. Empty open set after merge.

### Pedagogy — 2026-09-09

| Item | Outcome | Evidence |
|------|---------|----------|
| Q1 destination type | confirmed | GraphSchema inner type is string; corpus Data Model states it |
| Q2 meeting point | confirmed | Function comment plus GitNexus caller set |
| Q3 walk position | confirmed | session.schema currentActivity; pointer write at workflow-tools 842 |
| Q4 hierarchical grain | confirmed | corpus Domain Model plus hierarchical-dispatch.md |
| Q5 scalar consumers | confirmed | Caller enumeration in Meeting point |
| Template Traits / Resource Bounds missing from survey | resolved-by-challenge | Filled in corpus update; not a code question |

A later reader can learn the constraint from the corpus without this log. Result: no agent-resolvable residue.

### Rejected-paths — 2026-09-09

| Item | Outcome | Evidence |
|------|---------|----------|
| Child-workflow dispatch as the fan | confirmed | Children are nested sessions, each still scalar |
| Scatter-gather as the fan | confirmed | That primitive fans work units inside one activity |
| GitNexus process names as graph fans | confirmed | registerWorkflowTools is a function envelope, not a graph destination list |

Both rejections are in the corpus Domain Model and Glossary. Result: confirmed.

## Follow-up items (out of scope)

These are design questions the specification answers; they are not gaps in what the code does today.

- How a destination names several members, or one activity once per collection element — see the [specification](README.md).
- How a frontier list would sit beside currentActivity so a fan in flight is re-derivable after a crash.
- How workers are dispatched per branch while the session pointer is a scalar.
