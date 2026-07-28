---
metadata:
  version: 1.0.0
---

## Capability

Feature branch name in the workflows repo for this run's change.

## Inputs

### workflow_id

Id of the workflow this run authors or changes — the branch name's distinguishing segment.

### operation_type

The classified operation for the request — create, update or review.

## Outputs

### workflow_branch

The feature branch this run's definition changes are committed to: `workflow/{workflow_id}`, or that name plus a short change-intent slug when the plain name already carries an unrelated change.

## Protocol

### 1. Derive the Branch Name

- Set `{workflow_branch}` to `workflow/{workflow_id}`
- When `{operation_type}` is `update` and a branch of that name already exists carrying a prior change, append a short change-intent slug so this run has a branch of its own
