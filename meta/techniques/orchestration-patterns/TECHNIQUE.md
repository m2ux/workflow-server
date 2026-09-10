---
metadata:
  version: 2.0.0
---

## Capability

Shared Inputs, Outputs, and domain invariants for mid-phase multi-agent orchestration patterns. These patterns run their work units one at a time inside the calling worker; running them together is the graph's business, through a destination that fans. Session-level dispatch and fan-out primitives remain in workflow-engine, scatter-gather, and harness-compat.

## Inputs

### work_goal

The caller-facing goal or request text the pattern operates on.

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

### combined_synthesis

Single combined result produced from `{gathered_results}` under caller-supplied criteria.

## Rules

### isolation-then-combine

Honor [scatter-gather](../scatter-gather.md)::isolation-then-combine: per-unit outputs are gathered into an isolated ordered collection and merged only through the combine step.

### one-workspace-one-writer

Workers share the calling worker's workspace, so a worker writes only what its own brief names and never a sibling's output. Nothing here hands a worker a checkout of its own: giving each unit an isolated workspace is what a child session is for, through [handle-sub-workflow](../workflow-engine/handle-sub-workflow.md).

### workers-see-briefs-only

Worker prompts carry the assigned brief, output contract, and tools — not the parent's full reasoning or sibling briefs.

### no-nested-orchestrators

Honor [spawn-agent](../harness-compat/spawn-agent.md)::depth-1-only. Hierarchical depth uses [handle-sub-workflow](../workflow-engine/handle-sub-workflow.md) / `dispatch_child`, not nested Task orchestrators.

### prefer-activity-composition

Multi-op pipelines (decompose → dispatch → gather → synthesise) are bound as activity steps or borrowed pattern activities under `meta/activities/patterns/`. These ops do not `Apply` sibling orchestration-patterns operations for work.
