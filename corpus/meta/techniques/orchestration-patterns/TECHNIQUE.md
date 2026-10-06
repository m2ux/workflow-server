---
metadata:
  version: 2.2.0
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

### isolation-is-honoured-not-structural

A unit's output enters the ordered collection and reaches the parent bag only through the combine step, never auto-bound under its scalar name. The units share one worker, so the gather is the whole of what keeps them apart — the mode-independent form is `scatter-gather.isolation-then-combine`.

### one-workspace-one-writer

Workers share the calling worker's workspace, so a worker writes only what its own brief names. Nothing here hands a worker a checkout of its own.

### workers-see-briefs-only

Worker prompts carry the assigned brief, output contract, and tools — not the parent's full reasoning or sibling briefs.

### no-nested-orchestrators

Depth past this worker is a child session, through [handle-sub-workflow](../workflow-engine/handle-sub-workflow.md).

### prefer-activity-composition

Multi-op pipelines (decompose → dispatch → gather → synthesise) are bound as activity steps or borrowed pattern activities under `meta/activities/patterns/`. These ops do not `Apply` sibling orchestration-patterns techniques for work.
