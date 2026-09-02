---
metadata:
  version: 2.0.0
---

## Capability

The merge (M) sub-agent's brief, as a single-element brief set.

## Outputs

### worker_briefs

Singleton array `[{ id: "M", description, prompt }]` for the merge agent.

## Protocol

### 1. Compose Merge Brief

- Compose the M agent prompt containing: all scanner output file paths, the verification report, the [severity rubric](../../resources/cicd-severity-rubric.md#severity-matrix), and bootstrap instructions (`start_session(session_token, agent_id)`, then `next_activity({ activity_id: 'sub-merge' })`).
- Emit `{worker_briefs}` as a one-element array with `id` = `M`, `description` = findings merge, and `prompt` = the composed text.
- Do not dispatch — the binding activity binds [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md) next.
