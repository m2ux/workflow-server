---
metadata:
  version: 1.1.0
---

## Capability

Find saved client sessions matching a target workflow under `.engineering/artifacts/planning/`.

## Inputs

### target_workflow_id

Workflow ID to filter candidates by.

## Outputs

### saved_session_candidates

Array of `{ planning_slug, sessionIndex, savedAt, variables }` entries, one per planning folder recording a session for `{target_workflow_id}`.

## Protocol

1. List directories under `.engineering/artifacts/planning/`.
2. For each directory, read its `session.json` (the server-managed state file) and capture the directory name as the `planning_slug`. Skip a directory holding no `session.json`.
3. Treat a directory as a candidate when `{target_workflow_id}` equals either the top-level `workflowId`, or the `workflowId` of any entry in the top-level `triggeredWorkflows[]`.
4. Return as `{saved_session_candidates}` one entry per candidate directory, taking `sessionIndex`, `savedAt`, and `variables` from the matching `triggeredWorkflows[]` entry's `state` when the nested arm matched, and from the top level when the top-level arm matched.
