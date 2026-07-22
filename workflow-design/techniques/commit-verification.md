---
metadata:
  version: 1.1.0
---

## Capability

Verification that a commit on the session edit worktree landed completely.

## Protocol

### 1. Verify Commit

- Confirm the commit on `{target_path}` landed and that every created/modified file was included — no files missed

### 2. Completed-Steps Manifest

- When compiling the activity `steps_completed` list for finalize, include **every** executed step id in this activity — including trailing steps such as `verify-commit`, `push-branch`, `compose-workflow-pr-description`, `create-pr`, `mark-ready`, and `announce-completion`. Do not omit terminal steps from the manifest.
