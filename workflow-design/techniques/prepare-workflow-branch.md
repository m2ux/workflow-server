---
metadata:
  version: 1.0.0
---

## Capability

Ensure the workflows repo is on a dedicated feature branch for this workflow — creating `workflow/{workflow_id}` off the `workflows` branch, or checking it out if it already exists.

## Outputs

### workflow_branch

The feature branch the workflow's changes are committed to (e.g., `workflow/{workflow_id}`).

## Protocol

### 1. Derive Branch Name

- In the workflows repo, derive the feature branch name `workflow/{workflow_id}`; for an update whose branch already exists, suffix the change intent to keep it distinct

### 2. Create Or Check Out Branch

- Create and check out the branch off the current `workflows` branch tip, carrying the drafted (uncommitted) files onto it; if the branch already exists, check it out instead

### 3. Capture Branch Name

- Capture the branch name as `{workflow_branch}`
