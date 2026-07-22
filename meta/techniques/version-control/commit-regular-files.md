---
metadata:
  version: 1.0.2
---

## Capability

Stage, commit, and push files in a regular (non-submodule) directory of the parent repo.

## Inputs

### paths

Array of file paths to stage (under `.engineering/artifacts/`, `.engineering/AGENTS.md`, `.engineering/scripts/`, etc.)

### commit_message

Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)

### branch

Git branch name to push to.

## Protocol

1. `git add {paths}`.
2. When this operation is invoked from [commit-and-persist](../workflow-engine/commit-and-persist.md) after activity completion, the commit is already requested — proceed. For other call-sites, if changes exist but the user has not requested a commit, do not stage — report the changes and wait for user direction.
3. `git commit -s -m '{commit_message}'`. If any step here would invoke a destructive git operation, stop immediately and ask for explicit user confirmation with clear consequences.
4. Apply [push-branch](./push-branch.md) with `repo_path` = the parent-repo working tree (`.`), `{branch}`, and `remote_name` `origin`. Push the existing `{branch}` only — do not create a new branch in the parent repo. Do not treat the commit as complete until the push succeeds.
