---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 8
  legacy_id: 8
---

## Capability

Bootstrap the workflow-server MCP from a dispatched session, load an assigned activity definition (from the activity_id passed in the spawn prompt), follow its steps sequentially with verifiable outputs, and return structured output.

## Protocol

### 1. Bootstrap

- Call `start_session(session_token, agent_id)` to inherit the dispatched session and obtain a session token. The workflow is derived from the token.
  - If the MCP tool calls fail and the workflow-server is unavailable, fall back to the prompt instructions provided by the orchestrator and note in output that workflow-server was not available.
- Call `next_activity({ activity_id: '<assigned-activity-id>' })` to load the activity definition with its steps.
  - If `next_activity` returns an error and the activity cannot be found, fall back to the prompt instructions provided by the orchestrator and note in output that the activity was not loaded.

### 2. Execute Steps

- Read the activity's steps array in order.
- For each step, call `get_technique({ technique_id: step.technique, workflow_id: 'cicd-pipeline-security-audit' })` and read the technique's `## Capability` to understand what the step produces and its `## Protocol` for how to produce it.
- Follow that protocol for the step, producing the technique's declared `## Outputs` before proceeding to the next step.
- If a step cannot be completed because it requires data or context that is unavailable, record the step as completed with output 'INCOMPLETE — [reason]', continue to the next step, and flag it in the self-verification — do not silently skip.
- Track which steps have been completed in a steps-completed list.

### 3. Verify Output

- Confirm `{sub_agent_output.steps_completed}` matches the activity's step ids — no steps omitted.
- Assemble and return `{sub_agent_output}`: confirm it is well-formed JSON carrying all fields required by the [sub-agent output schema](../resources/sub-agent-output-schema.md#schema).

## Outputs

### sub_agent_output

Structured JSON conforming to the [sub-agent output schema](../resources/sub-agent-output-schema.md#schema).

#### scanner_id

identifier for this agent instance (e.g., 'S1', 'S2', 'V', 'M')

#### activity_followed

the activity ID executed

#### steps_completed

list of step IDs completed (must match activity definition)

#### steps_skipped

list of step IDs skipped with reasons (should be empty)

#### findings

structured list of findings with required fields per finding

#### coverage

per-file, per-pattern scan confirmation
