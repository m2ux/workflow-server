---
metadata:
  version: 1.4.0
---

## Capability

Stage and commit files in a regular (non-submodule) directory of the parent repo.

## Inputs

### paths

Array of file paths to stage (under `.engineering/artifacts/`, `.engineering/AGENTS.md`, `.engineering/scripts/`, etc.)

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

### is_signed

*(optional)* True when this commit is signed with the configured signing key. False or unset when the commit is unsigned.

#### default

`false`

## Protocol

### 1. Stage and Commit

- `git add {paths}`.
- When `{is_signed}` is true, `git commit -S -m '{commit_message}'`.
- When `{is_signed}` is false, `git commit --no-gpg-sign -m '{commit_message}'`.
