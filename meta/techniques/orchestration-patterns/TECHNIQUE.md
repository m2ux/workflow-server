---
metadata:
  version: 1.0.0
---

## Capability

Shared Inputs, Outputs, and domain invariants for mid-phase multi-agent orchestration patterns. Session-level dispatch and fan-out primitives remain in workflow-engine, scatter-gather, and harness-compat.

## Inputs

### goal

The caller-facing goal or request text the pattern operates on.

### concurrency

*(optional)* Positive integer. Default `1`. `1` = sequential dispatch; greater than `1` = parallel fan-out.

### isolation_mode

*(optional)* Default `context`. `context` — each worker gets an isolated context window. `worktree` — each worker also receives its own git worktree (or equivalent sandbox) under `{planning_folder_path}`.

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

Honor [scatter-gather](../scatter-gather.md)::isolation-then-combine for parallel fan-out.

### isolation-mode-write-boundary

Under `context` isolation, workers must not write sibling workspaces. Under `worktree` isolation, workers must create/use their worktree before mutating files.

### parallelism-is-optimisation

Honor [scatter-gather](../scatter-gather.md)::parallelism-is-optimisation (`concurrency = 1` remains correct).

### workers-see-briefs-only

Worker prompts carry the assigned brief, output contract, and tools — not the parent's full reasoning or sibling briefs.

### no-nested-orchestrators

Honor [spawn-agent](../harness-compat/spawn-agent.md)::depth-1-only. Hierarchical depth uses [handle-sub-workflow](../workflow-engine/handle-sub-workflow.md) / `dispatch_child`, not nested Task orchestrators.

### prefer-activity-composition

Multi-op pipelines (decompose → dispatch → gather → synthesise) are bound as activity steps or borrowed pattern activities under `meta/activities/patterns/`. These ops do not `Apply` sibling orchestration-patterns operations for work.
