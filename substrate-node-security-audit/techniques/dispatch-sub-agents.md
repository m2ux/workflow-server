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

List of agents to dispatch, each carrying its `agent_id`, its assigned `activity_id`, context variables (crate path, checklist sections, function registry entries), and supplementary files.

### expected_output_files

The set of per-agent output filenames each dispatched agent must persist into the planning folder, each named by the agent designator and scope with a `.json` extension.

## Protocol

### 1. Assign Roster

- Assign each in-scope crate to a sub-agent group per the [target profile](../resources/target-profile.md#agent-dispatch-assignments) Agent Dispatch Assignments and File Coverage Obligations, identifying the cross-crate supplementary files each agent needs, forming the `{agent_roster}`.
- Route every reconnaissance lead to a specific agent designator in `{agent_roster}`, producing a lead-to-agent routing table.

### 2. Compose Prompts

- For each agent in `{agent_roster}`, build a sub-agent prompt via [harness-compat](../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-agent](../../meta/techniques/harness-compat/spawn-agent.md), collected as `{$composed_prompts}`, containing: (1) bootstrap instructions — `start_session(session_token, agent_id)` to inherit the dispatched session, then `next_activity({ activity_id })` and follow the activity steps in order; (2) the agent's context variables; (3) supplementary cross-scope files for cross-boundary checks; (4) the requirement to return structured output conforming to the [output schema](../resources/sub-agent-output-schema.md#schema).

### 3. Dispatch All

- Dispatch every agent in `{agent_roster}` concurrently via [harness-compat](../../meta/techniques/harness-compat/TECHNIQUE.md)::[spawn-concurrent](../../meta/techniques/harness-compat/spawn-concurrent.md), forming `{$dispatched_agents}`, each using its `{composed_prompts}` entry.

### 4. Collect All

- Wait for all agents in `{dispatched_agents}` to return; collect each structured output into `{dispatch_results}`.
  > If an agent fails or does not return within the expected time, record the failure in `{dispatch_results}` and proceed with the available results.

### 5. Verify Dispatch Completeness

- Compare `{agent_roster}` against `{dispatched_agents}`; produce the `{dispatch_results.dispatch_manifest}` table with one row per agent (`agent_id`, assigned crate, dispatched, returned, status) and set `{dispatch_results.agents_dispatched}`.
  > If any roster agent was not dispatched or returned, mark the manifest `INCOMPLETE`; dispatch the missing agents before proceeding.

### 6. Verify Output Files

- For each expected filename in `{expected_output_files}`, confirm the file exists in `{planning_folder_path}`.
  > If any expected file is absent, re-dispatch the owning agent before proceeding.

## Outputs

### dispatch_results

Collected results from all dispatched sub-agents.

#### per_agent_output

Per-agent structured output conforming to the [output schema](../resources/sub-agent-output-schema.md#schema).

#### dispatch_summary

Count of agents dispatched and failures encountered.

#### dispatch_manifest

Per-agent table with assigned, dispatched, and returned status.

#### agents_dispatched

Count of agents actually dispatched and returned.

### agent_roster

Roster of agents to dispatch, with per-agent group assignment, supplementary files, and routed leads. Arrives if provided; exposed after assignment when built here.

## Rules

### orchestrator-reads-files-not-return-values

The orchestrator dispatches sub-agents and reads their persisted file outputs from `{planning_folder_path}`; it does not read source code, scan directories, or build registries, and it reads files rather than large sub-agent return values to avoid context accumulation.

### every-output-persisted-before-downstream-read

Every sub-agent persists its complete structured output as a JSON file in `{planning_folder_path}` before any orchestrator step reads it; all expected files must exist before downstream consumption.

### every-lead-routed-to-an-agent

Every reconnaissance lead — pattern, potential issue, or observation — is assigned to a specific agent designator in the roster; an unrouted lead is lost.

### prompts-free-of-reference-contamination

Sub-agent prompts carry no content from any reference report; every finding is independently derived from source.

### prompts-carry-calibration-benchmarks

Each agent prompt includes the relevant calibration benchmark entries from the [target profile](../resources/target-profile.md#severity-calibration-benchmark) for use as severity anchors.
