---
metadata:
  version: 2.0.0
---

## Capability

Compose each roster scanner's sub-agent prompt with workflow-server bootstrap instructions, submodule context, and output-schema requirements — producing `{worker_briefs}` for meta [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md). Domain prompt assembly only; dispatch is a separate activity step.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array aligned with `{scanner_assignments}` — `id` is each scanner designator (`S1`–`Sn`).

## Protocol

### 1. Compose Prompts

- For each agent in the `{scanner_assignments}` roster, build a prompt containing: (1) workflow-server bootstrap instructions — `start_session(session_token, agent_id)` to inherit the dispatched session, then `next_activity({ activity_id: 'sub-workflow-scan' })`, then follow the activity steps sequentially; (2) context — the submodule path, its workflow file list, the scanner designator (`S1`-`Sn`), `{planning_folder_path}`, and the slice of `{workflow_inventory}` for the assigned submodule; (3) the output-format requirement — write structured output to the [scanner output file](../../resources/sub-agent-output-schema.md#file-naming-convention) conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema).
- Emit `{worker_briefs}` with `id` = scanner designator, `description` = a short label for that scanner (submodule path), and `prompt` = the composed text.
- Do not dispatch agents from this operation — the binding activity binds [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md) next.
