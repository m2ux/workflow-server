---
metadata:
  version: 1.0.0
---

## Capability

Dispatch a child workflow under the current session as its parent.

## Inputs

### parent_session_index

The current session's `session_index` — parent for `dispatch_child`.

### workflow_id

Child workflow ID.

## Outputs

### child_session_index

The 6-character base32 `session_index` of the newly created child session.

## Protocol

1. Call `dispatch_child { session_index: {parent_session_index}, workflow_id: {workflow_id}, agent_id: 'workflow-orchestrator' }`; capture `{child_session_index}`. Same child-session shape as [create-session](./create-session.md) (server embeds under the parent; no separate child folder).
