---
name: execute-sub-agent
description: This skill defines how a sub-agent (dispatched by the orchestrator during primary-scan) bootstraps the workflow-server MCP, loads its assigned activity definition, and executes the activity's steps with verifiable outputs. The orchestrator passes activity_id and context in the spawn-agent prompt (harness-compat).
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
  order: 8
  legacy_id: 8
---

## Capability

Bootstrap the workflow-server, load an assigned activity, follow its steps sequentially, and return structured output

## Protocol

### 1. Bootstrap Get Rules

- Call start_session(session_token, agent_id) to inherit the dispatched session and obtain a session token. The workflow is derived from the token.

### 2. Bootstrap Get Activity

- Call next_activity({ activity_id: '<assigned-activity-id>' }) to load the activity definition with its steps

### 3. Exec Read Steps

- Read the activity's steps array in order

### 4. Exec Per Step Description

- For each step, read the description field to understand what is required

### 5. Exec Load Step Skill

- If a step references a skill (step.skill), call get_skill({ skill_id, workflow_id: 'cicd-pipeline-security-audit' }) and follow its protocol for that step

### 6. Exec Produce Output

- Produce the REQUIRED OUTPUT defined in the step's description before proceeding to the next step

### 7. Exec Na Justification

- If a step cannot be completed (e.g., no workflow files found for a pattern), record an explicit N/A with justification — do not silently skip

### 8. Exec Track Completed

- Track which steps have been completed in a steps_completed list

### 9. Verify Steps Match

- steps_completed matches the activity's step IDs — no steps omitted

### 10. Verify Json Complete

- The output JSON is well-formed and contains all required fields per the output schema ([sub-agent-output-schema](../resources/sub-agent-output-schema.md))

## Outputs

### sub-agent-output

Structured JSON conforming to [sub-agent-output-schema](../resources/sub-agent-output-schema.md) (sub-agent-output-schema).

- **scanner_id**: identifier for this agent instance (e.g., 'S1', 'S2', 'V', 'M')
- **activity_followed**: the activity ID executed (e.g., 'sub-workflow-scan', 'sub-verification', 'sub-merge')
- **steps_completed**: list of step IDs completed (must match activity definition)
- **steps_skipped**: list of step IDs skipped with reasons (should be empty)
- **findings**: structured list of findings with required fields per finding
- **coverage**: per-file, per-pattern scan confirmation

## Errors

### step_cannot_complete

**Cause:** A step requires data or context that is unavailable

**Recovery:** Record the step as completed with output 'INCOMPLETE — [reason]'. Continue to next step. Flag in the self-verification.

### activity_not_found

**Cause:** next_activity returns an error

**Recovery:** Fall back to the prompt instructions provided by the orchestrator. Note in output that activity was not loaded.

### workflow_server_unavailable

**Cause:** MCP tool calls fail

**Recovery:** Fall back to the prompt instructions. Note in output that workflow-server was not available.
