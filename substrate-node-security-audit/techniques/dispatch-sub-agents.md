---
name: dispatch-sub-agents
description: Defines the procedure for dispatching sub-agents during a multi-agent orchestrated workflow. The orchestrator provides the agent roster (IDs, activities, context); this skill defines how to compose the sub-agent prompt, include bootstrap instructions, attach context variables and cross-scope supplementary files, and dispatch all agents concurrently. See harness-compat skill for spawn-agent and spawn-concurrent operations.
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

### agent-roster

List of agents to dispatch, each with: agent_id, activity_id, context variables (e.g., crate_path, checklist_sections, function_registry), supplementary files

## Protocol

### 1. Compose Prompts

- For each agent in the roster, build a sub-agent prompt (spawn-agent operation, harness-compat skill) containing: (1) workflow-server bootstrap instructions — 'call start_session(session_token, agent_id) to inherit the dispatched session, then call next_activity with the assigned activity_id, follow the activity steps sequentially'; (2) context variables — crate path, in_scope/out_of_scope, function registry entries; (3) supplementary cross-scope files — file paths from other crates needed for cross-boundary checks; (4) output format requirement — 'return structured output conforming to the output schema resource.'

### 2. Dispatch All

- Dispatch all agents in the roster using harness-compat::spawn-concurrent. Each agent uses the composed prompt from step 1.

### 3. Collect All

- Wait for all agents to return. Collect structured output from each. If any agent fails or times out, record the failure and proceed with available results.

### 4. Verify Dispatch Completeness

- Compare the agent_roster (input) against the dispatched agent list. Every agent in the roster must have been dispatched and returned a result (success or failure). Produce a dispatch manifest table: agent_id, assigned_crate, dispatched (yes/no), returned (yes/no), status. If any agent was NOT dispatched, flag as INCOMPLETE and return the manifest to the orchestrator for remediation. Set agents_dispatched count. This step enforces the dispatch completeness gate.

## Outputs

### dispatch-results

Collected results from all dispatched sub-agents.

- **per_agent_output**: Per-agent structured output (conforming to the output schema resource)
- **dispatch_summary**: agents dispatched, failures encountered
- **dispatch_manifest**: per-agent table with assigned/dispatched/returned status

## Errors

### agent_timeout

**Cause:** Sub-agent did not return within expected time

**Recovery:** Record timeout; proceed with available results; orchestrator decides whether to re-dispatch

### incomplete_dispatch

**Cause:** One or more agents in the roster were not dispatched (e.g., skipped due to context pressure)

**Recovery:** Return INCOMPLETE status with the dispatch manifest. The orchestrator MUST dispatch the missing agents in a follow-up or flag the audit as incomplete. Do NOT proceed to structured-merge with missing agents.
