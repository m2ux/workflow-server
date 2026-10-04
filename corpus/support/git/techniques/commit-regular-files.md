---
metadata:
  version: 1.3.0
---

## Capability

Stage and commit files in a regular (non-submodule) directory of the parent repo.

## Inputs

### paths

Array of file paths to stage (under `.engineering/artifacts/`, `.engineering/AGENTS.md`, `.engineering/scripts/`, etc.)

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

## Protocol

### 1. Stage and Commit

- `git add {paths}`.
- `git commit --no-gpg-sign -m '{commit_message}'`.
