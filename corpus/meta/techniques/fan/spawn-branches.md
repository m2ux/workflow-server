---
metadata:
  version: 1.3.0
---

## Capability

Give every branch an identity and a stub, emit them all in one turn, and hand back what each returned in the order the fan opened them.

## Inputs

### branch_activities

The branches the fan opened, each as the id that addresses it, in the order the server gave them.

### agent_technique

Canonical agent technique for each branch worker.

#### default

`workflow-engine::activity-worker`

### variable_bag

The session's current variable bag (`session_index`, `workflow_id`, …).

## Outputs

### branch_envelopes

What each branch returned, one per entry of `{branch_activities}` and in that order.

## Protocol

### 1. Give each branch an identity and a stub

- For each entry of `{branch_activities}`, mint an identity per `one-identity-per-branch` and apply [compose-prompt](../workflow-engine/compose-prompt.md) with `{agent_technique}`, `holds_prior_deliveries: false`, and `{variable_bag}` as substitutions, adding that entry as `activity_id` and its own minted identity as `agent_id`

### 2. Emit the batch in one turn

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-concurrent](../harness-compat/spawn-concurrent.md) with every stub composed above, in a single response turn

### 3. Take the returns

- The turn resumes once every branch has returned. Collect the returns in input order as `{branch_envelopes}`
