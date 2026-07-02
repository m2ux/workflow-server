---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 4
  legacy_id: 4
---

# Dispatch Sub-Agents

## Capability

Assign crates to sub-agent groups, route reconnaissance leads to those agents, dispatch the roster concurrently with workflow-server bootstrap instructions and supplementary files, collect the structured results, and confirm every expected output file persisted. Each phase is a named operation; a step binds the one operation for its phase.

## Inputs

### agent_roster

List of agents to dispatch, each carrying its `agent_id`, its assigned `activity_id`, context variables (crate path, checklist sections, function registry entries), and supplementary files.

## Rules

### orchestrator-reads-persisted-files

The orchestrator dispatches sub-agents and reads their persisted file outputs from `{planning_folder_path}`; it does not read source code, scan directories, or build registries, and it reads files rather than large sub-agent return values to avoid context accumulation.

### every-output-persisted-before-downstream-read

Every sub-agent persists its complete structured output as a JSON file in `{planning_folder_path}` before any orchestrator step reads it; all expected files must exist before downstream consumption.

### every-lead-routed-to-an-agent

Every reconnaissance lead — pattern, potential issue, or observation — is assigned to a specific agent designator in the roster; an unrouted lead is lost.

### prompts-free-of-reference-contamination

Sub-agent prompts carry no content from any reference report; every finding is independently derived from source.

### prompts-carry-calibration-benchmarks

Each agent prompt includes the relevant calibration benchmark entries from the [target profile](../../resources/target-profile.md#severity-calibration-benchmark) for use as severity anchors.
