---
metadata:
  version: 1.8.0
---

## Capability

Give every branch an identity. Each entry of the result names that branch and the identity minted for it.

## Inputs

### branch_activities

The branches the fan opened, each as the id that addresses it, in the order the server gave them.

## Outputs

### branches

The branches in `{branch_activities}` order. Each entry is `{ activity_id, agent_id }`.

## Protocol

### 1. Mint Branch Identity

- For each entry of `{branch_activities}`, mint an identity per `one-identity-per-branch`. `{branches}` is those entries in `{branch_activities}` order.
