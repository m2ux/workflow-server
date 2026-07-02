---
metadata:
  version: 1.0.0
---

## Capability

Compose each agent's sub-agent prompt with workflow-server bootstrap instructions, context variables, and supplementary files, then dispatch every agent in the roster concurrently.

## Outputs

### dispatched_agents

The set of agents dispatched concurrently, each with its composed prompt.

## Protocol

### 1. Compose Prompts

- For each agent in `{agent_roster}`, build a sub-agent prompt via [harness-compat](../../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../../meta/techniques/harness-compat/spawn-agent.md), collected as `{$composed_prompts}`, containing: (1) bootstrap instructions — `start_session(session_token, agent_id)` to inherit the dispatched session, then `next_activity({ activity_id })` and follow the activity steps in order; (2) the agent's context variables; (3) supplementary cross-scope files for cross-boundary checks; (4) the requirement to return structured output conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema).

### 2. Dispatch All

- Dispatch every agent in `{agent_roster}` concurrently via [harness-compat](../../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-concurrent](../../../meta/techniques/harness-compat/spawn-concurrent.md), forming `{dispatched_agents}`, each using its `{composed_prompts}` entry.
