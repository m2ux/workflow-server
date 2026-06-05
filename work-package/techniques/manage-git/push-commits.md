---
metadata:
  version: 1.0.0
---

## Capability

Push local commits on the feature branch to the remote.

## Inputs

### target_path

The working directory (worktree)

### branch_name

Feature branch being pushed

## Protocol

1. From `target_path`, push all local commits on `branch_name` to origin.
2. Verify the push succeeded.
