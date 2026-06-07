---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.2.0
  order: 4
  legacy_id: 4
---

## Capability

Compose sub-agent prompts with workflow-server bootstrap instructions, context variables, and supplementary files; dispatch all agents concurrently

## Inputs

### agent_roster

List of agents to dispatch, each with: agent_id, activity_id, context variables (e.g., crate-path, checklist-sections, function-registry), supplementary files

## Protocol

### 1. Compose Prompts

- For each agent in the roster, build a sub-agent prompt (spawn-agent operation, harness-compat technique) — collected as `{$composed_prompts}` — containing: (1) workflow-server bootstrap instructions — 'call start_session(session_token, agent_id) to inherit the dispatched session, then call next_activity with the assigned activity_id, follow the activity steps sequentially'; (2) context variables — crate path, in-scope/out-of-scope, function registry entries; (3) supplementary cross-scope files — file paths from other crates needed for cross-boundary checks; (4) output format requirement — 'return structured output conforming to the [output schema](../resources/sub-agent-output-schema.md#schema).'

### 2. Dispatch All

- Dispatch all agents in the roster using harness-compat::spawn-concurrent, forming `{$dispatched_agents}`. Each agent uses the `{composed_prompts}` from step 1.

### 3. Collect All

- Wait for all agents to return. Collect the structured output from each into {dispatch_results}. If any agent fails or times out, record the failure in {dispatch_results} and proceed with available results.
- If a sub-agent does not return within the expected time, record the timeout in {dispatch_results} and proceed with the available results; the orchestrator decides whether to re-dispatch.

### 4. Verify Dispatch Completeness

- Compare the {agent_roster} (input) against `{dispatched_agents}`. Every agent in the roster must have been dispatched and returned a result (success or failure). Produce a dispatch manifest table: agent_id, assigned-crate, dispatched (yes/no), returned (yes/no), status. If any agent was NOT dispatched, flag as INCOMPLETE and return the manifest to the orchestrator for remediation. Set agents-dispatched count. This step enforces the dispatch completeness gate.
- If one or more agents in the roster were not dispatched (e.g., skipped due to context pressure), return INCOMPLETE status with the dispatch manifest. The orchestrator MUST dispatch the missing agents in a follow-up or flag the audit as incomplete. Do NOT proceed to finding consolidation with missing agents.

## Outputs

### dispatch_results

Collected results from all dispatched sub-agents.

#### per_agent_output

Per-agent structured output (conforming to the output schema resource)

#### dispatch_summary

agents dispatched, failures encountered

#### dispatch_manifest

per-agent table with assigned/dispatched/returned status
