---
metadata:
  version: 1.0.0
---

## Capability

Wait for every dispatched agent to return, collect each structured output, and produce the dispatch manifest that records which roster agents were dispatched and returned.

## Outputs

### dispatch_results

Collected results from all dispatched sub-agents.

#### per_agent_output

Per-agent structured output conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema).

#### dispatch_summary

Count of agents dispatched and failures encountered.

#### dispatch_manifest

Per-agent table with `agent_id`, assigned crate, dispatched, returned, and status.

#### agents_dispatched

Count of agents actually dispatched and returned.

## Protocol

### 1. Collect All

- Wait for all agents in `{dispatched_agents}` to return; collect each structured output into `{dispatch_results}`.
  > If an agent fails or does not return within the expected time, record the failure in `{dispatch_results}` and proceed with the available results.

### 2. Verify Dispatch Completeness

- Compare `{agent_roster}` against `{dispatched_agents}`; produce the `{dispatch_results.dispatch_manifest}` table with one row per agent (`agent_id`, assigned crate, dispatched, returned, status) and set `{dispatch_results.agents_dispatched}`.
  > If any roster agent was not dispatched or returned, mark the manifest `INCOMPLETE`; dispatch the missing agents before proceeding.
