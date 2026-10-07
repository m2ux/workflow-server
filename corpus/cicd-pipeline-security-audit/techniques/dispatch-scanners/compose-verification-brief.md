---
metadata:
  version: 2.1.0
---

## Capability

The verification (V) sub-agent's brief, as a single-element brief set.

## Inputs

### workflow_inventory

Complete [inventory of workflow files](../../resources/intermediate-artifact-schemas.md#workflow-inventory) with per-workflow trigger, permission, and checkout classification data.

## Outputs

### worker_briefs

Singleton array `[{ id: "V", description, prompt }]` for the verification agent.

## Protocol

### 1. Compose Verification Brief

- Compose the V agent prompt containing: all scanner output file paths, the `{workflow_inventory}`, and bootstrap instructions (`start_session(session_token, agent_id)`, then `next_activity({ activity_id: 'sub-verification' })`).
- Emit `{worker_briefs}` as a one-element array with `id` = `V`, `description` = coverage verification, and `prompt` = the composed text.
- Do not dispatch — the binding activity binds [orchestration-patterns](/meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](/meta/techniques/orchestration-patterns/dispatch-workers.md) next.
