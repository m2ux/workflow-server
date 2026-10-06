---
metadata:
  version: 2.15.0
---

## Capability

Compose a minimal stub that binds agent identity and directs the agent to Apply a bundled workflow-engine agent technique.

## Inputs

### agent_technique

Canonical agent technique — workflow-engine::activity-worker or workflow-engine::workflow-orchestrator. A worker continued past a gate takes activity-worker.

### substitutions

Map of placeholder name → value. Must include `session_index`, `workflow_id`, and `agent_id`, and `activity_id` as well for activity-worker.

### holds_prior_deliveries

Whether `agent_id` names a context that already received content under this session — true when continuing a worker onto the next activity of its batch, false for a freshly minted identity.

## Outputs

### composed_prompt

Minimal stub string ready for the host invoke that spawns or continues the agent.

## Protocol

### 1. Bind Identity

- Emit a one-line role from `{agent_technique}`: activity worker for `{workflow_id}`, or workflow orchestrator for `{workflow_id}`
- Emit Session bindings from `{substitutions}` (`session_index`, `workflow_id`, `agent_id`, and `activity_id` when present)

### 2. Emit Entry Tools

- Instruct [resume-from-checkpoint](./resume-from-checkpoint.md) before the activity-worker line below, and carry `{checkpoint_reply}` on its `resume_checkpoint` call.
  > When `{checkpoint_reply}` is bound, and `{agent_technique}` is activity-worker.
- When `{agent_technique}` is [activity-worker](./activity-worker.md): instruct `get_activity { session_index, context_tokens, agent_id, activity_id }` — `agent_id` scopes delivery to this worker context (`agent-id-scopes-delivery`); `activity_id` names the activity this worker was dispatched for. Add `bundle: "reference"` to that call when `{holds_prior_deliveries}`, so what the context already holds arrives as unchanged markers; omit it otherwise
- When `{agent_technique}` is [workflow-orchestrator](./workflow-orchestrator.md): instruct `get_workflow { session_index }`, which delivers the techniques bundle the Direct Apply phase names. Its session is already open and its identity is bound in the block above; this call scopes to neither, and the orchestrator spends `agent_id` on the delivery calls that take one

### 3. Direct Apply

- Instruct the agent to Apply `{agent_technique}` from the returned ops bundle and follow that technique's Protocol and Rules
- Do not project the technique Protocol into the stub

### 4. Emit Composed Prompt

- Emit the assembled text as `{composed_prompt}`

## Rules

### context-travels-as-state

`{composed_prompt}` does not restate artifact content, decisions, or scope lists. A fact the worker needs and no variable carries is a missing declaration.
