---
metadata:
  version: 1.0.0
---

## Capability

Dispatch a fresh client workflow as a child of the meta session.

## Inputs

### parent-session-index

`session-index` of the meta (parent) session — typically the `meta_session-index` variable.

### workflow-id

Target client workflow id (e.g., `work-package`).

## Output

### session-index

The 6-character base32 `session-index` of the newly created child session

## Protocol

1. Call `dispatch_child { session-index: <parent-session-index>, workflow-id: <workflow-id>, agent_id: 'orchestrator' }`; capture the returned `session-index` for use in all subsequent calls inside the child workflow. The server appends the child under `parent.triggeredWorkflows[N].state` and embeds the full child SessionFile inline; the agent does not deal with separate child folders.
