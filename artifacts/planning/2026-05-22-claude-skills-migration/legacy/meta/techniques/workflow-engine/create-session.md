# create-session

Dispatch a fresh client workflow as a child of the meta session.

## Inputs

- **parent_session_index** — `session_index` of the meta (parent) session — typically the `meta_session_index` variable
- **workflow_id** — Target client workflow id (e.g., `work-package`)

## Output

- **session_index** — The 6-character base32 `session_index` of the newly created child session

## Procedure

1. Call `dispatch_child({ session_index: <parent_session_index>, workflow_id: <target client workflow id>, agent_id: 'orchestrator' })`; capture the returned `session_index` for use in all subsequent calls inside the child workflow. The server appends the child under `parent.triggeredWorkflows[N].state` and embeds the full child SessionFile inline; the agent does not deal with separate child folders.
