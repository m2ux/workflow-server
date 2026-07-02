---
metadata:
  version: 1.0.0
---

## Capability

Assign each in-scope crate to a sub-agent group and identify the cross-crate supplementary files each agent needs, forming the agent roster.

## Outputs

### agent_roster

Roster of agents to dispatch, with per-agent group assignment and supplementary files.

## Protocol

### 1. Assign Roster

- Assign each in-scope crate to a sub-agent group per the [target profile](../../resources/target-profile.md#agent-dispatch-assignments) Agent Dispatch Assignments and File Coverage Obligations, identifying the cross-crate supplementary files each agent needs, forming the `{agent_roster}`.
