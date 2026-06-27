---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Ensure the workflows repo is on a dedicated feature branch for this workflow before its changes are committed — creating `workflow/{workflow_id}` off the `workflows` branch (or checking it out if it already exists) — so the work lands on a branch for review rather than directly on `workflows`.

## Outputs

### workflow_branch

The feature branch the workflow's changes are committed to (e.g., `workflow/{workflow_id}`).

## Protocol

### 1. Prepare Feature Branch

- In the workflows repo, derive the feature branch name `workflow/{workflow_id}`; for an update whose branch already exists, suffix the change intent to keep it distinct
- Create and check out the branch off the current `workflows` branch tip, carrying the drafted (uncommitted) files onto it; if the branch already exists, check it out instead
- Capture the branch name as `{workflow_branch}`
