---
metadata:
  version: 1.4.1
---

## Capability

Stage and commit files in a regular (non-submodule) directory of the parent repo.

## Inputs

### paths

Array of file paths to stage (under `.engineering/artifacts/`, `.engineering/AGENTS.md`, `.engineering/scripts/`, etc.)

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

### is_signed

*(optional)* False by default: the commit is unsigned. True when this commit is signed with the configured signing key.

#### default

`false`

## Protocol

### 1. Stage

- `git add {paths}`.

### 2. Commit
- When `{is_signed}` is true, `git commit -S -m '{commit_message}'`.
- When `{is_signed}` is not true, `git commit --no-gpg-sign -m '{commit_message}'`.
