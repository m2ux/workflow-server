---
metadata:
  version: 1.0.0
---

## Capability

Find saved client sessions matching a target workflow under `.engineering/artifacts/planning/`.

## Inputs

### target_workflow_id

Workflow ID to filter candidates by

## Output

### candidates

Array of `{ planning_slug, sessionIndex, savedAt, variables }` entries whose `workflowId` matches

## Protocol

1. List directories under `.engineering/artifacts/planning/`.
2. For each directory, read its `session.json` (the server-managed state file) and capture the directory name as the `planning_slug`.
3. Keep entries whose `workflowId` equals `target_workflow_id`.
