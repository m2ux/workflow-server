---
metadata:
  version: 2.0.0
---

## Capability

Compose each roster agent's sub-agent prompt with workflow-server bootstrap instructions, context variables, supplementary files, output-schema requirements, and calibration benchmarks — producing `{worker_briefs}` for meta [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md). Domain prompt assembly only; dispatch is a separate activity step.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array aligned with `{agent_roster}` — `id` is each agent's `agent_id`.

## Protocol

### 1. Compose Prompts

- For each agent in `{agent_roster}`, build a prompt containing: (1) bootstrap instructions — `start_session` with the session index and `agent_id` to inherit the dispatched session, then follow the assigned activity steps in order; (2) the agent's context variables; (3) supplementary cross-scope files for cross-boundary checks; (4) the requirement to return structured output conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema); (5) relevant calibration benchmark entries from the [target profile](../../resources/target-profile.md#severity-calibration-benchmark).
- Emit `{worker_briefs}` with `id` = `agent_id`, `description` = a short label for that agent, and `prompt` = the composed text.
- Do not dispatch agents from this operation — the binding activity binds [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md) next.
