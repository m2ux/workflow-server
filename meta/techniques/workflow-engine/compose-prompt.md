---
metadata:
  version: 2.5.0
---

## Capability

Compose a minimal stub that binds agent identity and directs the agent to Apply a bundled workflow-engine agent technique.

## Inputs

### agent_technique

Canonical agent technique — workflow-engine::activity-worker, workflow-engine::workflow-orchestrator, or workflow-engine::resume-from-checkpoint.

### substitutions

Map of placeholder name → value. Must include `session_index`, `workflow_id`, and `agent_id`; `activity_id` as well for activity-worker and resume-from-checkpoint, and `effects` for resume-from-checkpoint.

### holds_prior_deliveries

Whether `agent_id` names a context that already received content under this session — true when continuing a worker onto the next activity of its batch, false for a freshly minted identity. Decides the delivery mode the stub asks for, which the receiving agent cannot infer: a fresh context reading unchanged markers holds none of the bytes they stand for.

## Outputs

### composed_prompt

Minimal stub string ready for the host invoke that spawns or continues the agent.

## Protocol

### 1. Bind identity

- Emit a one-line role from `{agent_technique}`: activity worker for `{workflow_id}`, workflow orchestrator for `{workflow_id}`, or the same activity worker continuing `{activity_id}`
- Emit Session bindings from `{substitutions}` (`session_index`, `workflow_id`, `agent_id`, and `activity_id` when present)

### 2. Emit entry tools

- When `{agent_technique}` is [activity-worker](./activity-worker.md): instruct `get_activity { session_index, context_tokens, agent_id }` — `context_tokens` is the agent's context window size and is **required**; `agent_id` scopes delivery to this worker context ([agent-id-scopes-delivery](./TECHNIQUE.md#agent-id-scopes-delivery)). Add `bundle: "reference"` to that call when `{holds_prior_deliveries}`, so what the context already holds arrives as unchanged markers; omit it otherwise, because a fresh context needs the bytes
- When `{agent_technique}` is [workflow-orchestrator](./workflow-orchestrator.md): instruct `start_session { session_index, agent_id }` then `get_workflow { session_index }`
- When `{agent_technique}` is [resume-from-checkpoint](./resume-from-checkpoint.md): instruct `resume_checkpoint { session_index }` and carry the `effects` substitution

### 3. Direct Apply

- Instruct the agent to Apply `{agent_technique}` from the returned ops bundle and follow that technique's Protocol and Rules
- Do not project the technique Protocol into the stub

### 4. Return stub

- Emit the assembled text as `{composed_prompt}`

## Rules

### context-travels-as-state

Prior-activity context reaches a worker as state, not as prose in the stub. Artifact paths, decisions, and measurements already live in the session bag and in the artifacts those bag variables point at; the worker binds them through its activity's step inputs. Do not restate artifact content, decisions, or scope lists in `{composed_prompt}` — a paraphrase drifts from the artifact that records it, and the worker cannot tell which is authoritative. A fact the worker needs and no variable carries is a missing declaration, not a licence to inline.
