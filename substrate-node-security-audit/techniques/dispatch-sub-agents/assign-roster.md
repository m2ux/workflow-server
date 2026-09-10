---
metadata:
  version: 2.0.0
---

## Capability

Assign each in-scope crate to a sub-agent group and identify the cross-crate supplementary files each agent needs, forming the agent roster.

## Outputs

### agent_roster

Roster of agents to dispatch, with per-agent group assignment and supplementary files.

### crate_review_roster

The roster entries whose group performs a crate deep review, in agent order. Each carries its designator at `id` alongside the entry's own fields, because the id names that agent's slot in the branch container, its row in the gather manifest, and the instance that runs it.

## Protocol

### 1. Assign Roster

- Assign each in-scope crate to a sub-agent group per the [target profile](../../resources/target-profile.md#agent-dispatch-assignments) Agent Dispatch Assignments and File Coverage Obligations, identifying the cross-crate supplementary files each agent needs, forming the `{agent_roster}`.

### 2. Separate The Crate Reviews

- Emit the crate-review entries as `{crate_review_roster}`, in agent order, each carrying its designator at `id`. The graph fans this activity's exit over that roster and runs the static-analysis and toolkit groups beside it as branches of their own, so the three groups open together and every entry here becomes one instance of the crate review.
- An entry appears in exactly one place. A group named both here and as a branch of its own would be audited twice and reconciled as a duplicate, and the merge has no way to tell that from two agents genuinely finding the same thing.
