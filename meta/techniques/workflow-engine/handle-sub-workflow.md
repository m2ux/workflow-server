---
metadata:
  version: 1.0.0
---

## Capability

Dispatch a child workflow under the current session as its parent.

## Inputs

### parent-session-index

The current session's `session-index` — passed to the server so it can append the child under the parent's `triggeredWorkflows[]` with the child's SessionFile embedded inline.

### workflow-id

Child workflow ID.

## Output

### child-session-index

The 6-character base32 `session-index` of the newly created child session.

## Protocol

1. Call `dispatch_child { session-index: <parent-session-index>, workflow-id: <workflow-id>, agent_id: 'workflow-orchestrator' }`; capture `child-session-index` from the response. The child SessionFile is embedded under `parent.triggeredWorkflows[N].state` in the top-level `session.json` — no separate child folder.
