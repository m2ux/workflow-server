---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.1.0
  order: 2
  legacy_id: 2
---

## Capability

Bootstrap the workflow-server, load an assigned activity, follow its steps sequentially, and return structured output

## Protocol

### 1. Bootstrap

- Call `start_session(session_token, agent_id)` to inherit the dispatched session and obtain a session token. The workflow is derived from the token.  
  > If these MCP tool calls fail because the workflow-server is unavailable, fall back to the prompt instructions provided by the orchestrator and note in the output that workflow-server was not available.
- Call `next_activity({ activity_id: '<assigned-activity-id>' })` to load the activity definition with its steps.  
  > If `next_activity` returns an error and the activity cannot be loaded, fall back to the prompt instructions provided by the orchestrator and note in the output that the activity was not loaded.

### 2. Execute Steps

- Read the activity's steps array in order.
- For each step, load its bound technique via `get_technique` and read that technique's `## Capability` (what the step does) and `## Protocol` (how to do it).
- Produce the output the bound technique defines in its `## Output(s)` before proceeding to the next step.
- If a step cannot be completed (e.g., no `StorageMap`s in the crate for the lifecycle scan), record an explicit N/A with justification — do not silently skip.
- If a step requires data or context that is unavailable, record the step as completed with output 'INCOMPLETE — [reason]', continue to the next step, and flag it in the self-verification.
- Track which steps have been completed in `{sub_agent_output.steps_completed}`.

### 3. Verify Output

- Assemble `{sub_agent_output}` and verify it against the checks below before returning it.
- `{sub_agent_output.steps_completed}` matches the activity's step IDs — no steps omitted.
- Every FAIL in `{sub_agent_output.checklist_coverage}` has a corresponding finding in `{sub_agent_output.findings}`.
- Every `{sub_agent_output.mandatory_tables}` entry is either populated or null with justification.
- `{sub_agent_output}` is well-formed JSON and contains all required fields.

## Outputs

### sub_agent_output

Structured JSON conforming to the [sub-agent-output-schema](../resources/sub-agent-output-schema.md).

#### agent_id

identifier for this agent instance (e.g., 'group-a-nto', 'group-b', 'group-d')

#### activity_followed

the activity ID executed (e.g., 'sub-crate-review')

#### steps_completed

list of step IDs completed (must match activity definition)

#### steps_skipped

list of step IDs skipped with reasons (should be empty)

#### findings

structured list of findings with required fields per finding

#### checklist_coverage

per-§3-item verdicts (for crate review) or per-pattern results (for static analysis)

#### mandatory_tables

all tables the steps produce, or null with justification

#### reconnaissance_leads

observations not formal findings but for orchestrator review (optional)

## Rules

### output-persisted-as-json-file

The sub-agent writes its complete structured output as a JSON file into `{planning_folder_path}`, named by the agent designator and scope; this file is the canonical source for the merge agent and the auditable record of the agent's work.

### output-conforms-to-schema

The sub-agent's final output conforms to the [sub-agent-output-schema](../resources/sub-agent-output-schema.md#schema).
