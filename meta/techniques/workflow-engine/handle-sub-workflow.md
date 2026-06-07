---
metadata:
  version: 1.0.0
---

## Capability

Dispatch a child workflow under the current session as its parent.

## Inputs

### parent_session_index

The current session's `session_index` — passed to the server so it can append the child under the parent's `triggeredWorkflows[]` with the child's SessionFile embedded inline.

### workflow_id

Child workflow ID.

## Output

### child_session_index

The 6-character base32 `session_index` of the newly created child session.

## Protocol

1. Call `dispatch_child { session_index: <parent_session_index>, workflow_id: <workflow_id>, agent_id: 'workflow-orchestrator' }`; capture `child_session_index` from the response. The child SessionFile is embedded under `parent.triggeredWorkflows[N].state` in the top-level `session.json` — no separate child folder.
