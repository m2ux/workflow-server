---
metadata:
  version: 2.0.0
---

## Capability

Compose a minimal spawn stub that binds agent identity and directs the agent to Apply a bundled workflow-engine agent technique (activity-worker or workflow-orchestrator).

## Inputs

### agent_technique

Canonical agent technique — workflow-engine::activity-worker or workflow-engine::workflow-orchestrator.

### substitutions

Map of placeholder name → value. Must include `session_index`, `workflow_id`, and `agent_id`. For activity-worker, must also include `activity_id`.

## Outputs

### composed_prompt

Minimal stub string ready for the host spawn invoke.

## Protocol

### 1. Bind identity

- Emit a one-line role from `{agent_technique}`: activity worker for `{workflow_id}`, or workflow orchestrator for `{workflow_id}`
- Emit Session bindings from `{substitutions}` (`session_index`, `workflow_id`, `agent_id`, and `activity_id` when present)

### 2. Emit entry tools

- When `{agent_technique}` is [activity-worker](./activity-worker.md): instruct `get_activity { session_index, context_tokens }` — `context_tokens` is the agent's context window size and is **required**
- When `{agent_technique}` is [workflow-orchestrator](./workflow-orchestrator.md): instruct `start_session { session_index, agent_id }` then `get_workflow { session_index }`

### 3. Direct Apply

- Instruct the agent to Apply `{agent_technique}` from the returned ops bundle and follow that technique's Protocol and Rules
- Do not project the technique Protocol into the stub

### 4. Return stub

- Emit the assembled text as `{composed_prompt}`
