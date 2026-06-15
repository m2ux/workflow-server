---
metadata:
  version: 1.0.0
---

## Capability

Stage, commit, and push files in a regular (non-submodule) directory of the parent repo.

## Inputs

### paths

Array of file paths to stage (under `.engineering/artifacts/`, `.engineering/AGENTS.md`, `.engineering/scripts/`, etc.)

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

### branch

Branch to push to (typically the current branch — do NOT create a new branch in the parent repo)

## Protocol

1. `git add {paths}`. If changes exist but the user has not requested a commit, do not stage — report the changes and wait for user direction.
2. `git commit -s -m '{commit_message}'`. If any step here would invoke a destructive git operation, stop immediately and ask for explicit user confirmation with clear consequences.
3. `git push origin {branch}`.
