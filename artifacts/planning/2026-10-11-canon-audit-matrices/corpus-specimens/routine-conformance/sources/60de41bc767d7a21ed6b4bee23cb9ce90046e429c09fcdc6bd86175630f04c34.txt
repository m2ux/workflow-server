---
metadata:
  version: 1.0.0
---

## Capability

Confirmation that a commit on the run's edit worktree landed complete.

## Protocol

### 1. Verify the Commit Landed Complete

- Confirm the commit exists on the branch checked out at `{target_path}`, and that every file the change created or modified is in it
- A file the change touched and the commit omitted is the failure this check exists to catch; report it rather than committing again over it
