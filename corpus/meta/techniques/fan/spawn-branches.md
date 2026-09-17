---
metadata:
  version: 1.0.0
---

## Capability

Give every branch an identity and a stub, emit them all in one turn, and hand back what each returned in the order the fan opened them.

## Inputs

### branch_list

The branches the fan opened, in the order the server gave them.

### agent_technique

Canonical agent technique for each branch worker — default workflow-engine::activity-worker.

### state

Current variable state for stub substitution (`session_index`, `workflow_id`, …), which each branch's stub is completed from with its own activity and identity.

## Outputs

### branch_envelopes

What each branch returned, one per entry of `{branch_list}` and in that order.

## Protocol

### 1. Give each branch an identity and a stub

- For each entry of `{branch_list}`, mint an identity per `one-identity-per-branch` and apply [compose-prompt](../workflow-engine/compose-prompt.md) with `{agent_technique}`, `holds_prior_deliveries: false`, and `{state}` as substitutions, adding that entry as `activity_id` and its own minted identity as `agent_id`. A minted identity holds nothing, so each branch takes its activity in full

### 2. Emit the batch in one turn

- Apply [harness-compat](../harness-compat/TECHNIQUE.md)::[spawn-concurrent](../harness-compat/spawn-concurrent.md) with every stub composed above, in a single response turn. Identity, stub and spawn are one act: a stub composed for an identity no longer being spawned, or a spawn emitted across two turns, is neither half of what the fan is for

### 3. Take the returns

- The turn does not resume until every branch has returned, so joining is a fact of the turn rather than something polled, timed out or scheduled. Collect the returns in input order as `{branch_envelopes}`
