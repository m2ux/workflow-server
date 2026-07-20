---
metadata:
  version: 1.0.0
---

## Capability

Shared Inputs, Outputs, and domain invariants for mid-phase multi-agent orchestration: work-unit decomposition, specialist routing, worker brief composition, dispatch, ordered gather with completeness, synthesis, plan-and-execute, research fan-out, and opaque agent-as-tool invocation. Session-level orchestrator/worker dispatch remains [workflow-engine](../workflow-engine/TECHNIQUE.md)::[dispatch-activity](../workflow-engine/dispatch-activity.md); fan-out primitives remain [scatter-gather](../scatter-gather.md) and [harness-compat](../harness-compat/TECHNIQUE.md).

## Inputs

### goal

The caller-facing goal or request text the pattern operates on.

### concurrency

*(optional)* Positive integer. Default `1`. `1` = sequential dispatch; greater than `1` = parallel fan-out via [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-concurrent](../harness-compat/spawn-concurrent.md).

### isolation_mode

*(optional)* Default `context`. `context` — each worker gets an isolated context window and must not write sibling workspaces. `worktree` — each worker also receives its own git worktree (or equivalent sandbox) under `{planning_folder_path}` before mutating files.

### effort_cap

*(optional)* Positive integer bounding how many workers or follow-up rounds a pattern may spawn for one invocation.

### planning_folder_path

Canonical absolute planning folder for optional persisted worker artifacts.

## Outputs

### work_units

Ordered array of work units. Each entry has `id`, `brief`, and optional `tools_hint`.

### worker_briefs

Ordered array of `{ id, description, prompt }` ready for dispatch.

### gathered_results

Ordered keyed collection of per-unit worker outputs plus a dispatch completeness manifest.

### synthesis

Single combined result produced from `{gathered_results}` under caller-supplied criteria.

## Rules

### isolation-then-combine

Parallel worker outputs stay isolated until a gather + synthesise path merges them. Never auto-bind per-instance scalar outputs into the parent bag by name.

### parallelism-is-optimisation

Sequential dispatch (`concurrency = 1`) is always valid for correctness. Parallel mode adds concurrency and isolation only.

### workers-see-briefs-only

Worker prompts carry the assigned brief, output contract, and tools — not the parent's full reasoning or sibling briefs.

### no-nested-orchestrators

Dispatch uses [harness-compat](../harness-compat/TECHNIQUE.md) depth-1 only. Hierarchical depth uses [workflow-engine](../workflow-engine/TECHNIQUE.md)::[handle-sub-workflow](../workflow-engine/handle-sub-workflow.md) / `dispatch_child`, not nested Task orchestrators.

### prefer-activity-composition

Multi-op pipelines (decompose → dispatch → gather → synthesise) are bound as activity steps or borrowed pattern activities under `meta/activities/patterns/`. These ops do not `Apply` sibling orchestration-patterns operations for work.
