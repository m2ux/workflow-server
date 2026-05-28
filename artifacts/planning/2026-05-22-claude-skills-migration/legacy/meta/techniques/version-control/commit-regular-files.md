# commit-regular-files

Stage, commit, and push files in a regular (non-submodule) directory of the parent repo.

## Inputs

- **paths** — Array of file paths to stage (under `.engineering/artifacts/`, `.engineering/AGENTS.md`, `.engineering/scripts/`, etc.)
- **message** — Conventional Commits message (e.g., `docs(work-package): activity-X artifacts`)
- **branch** — Branch to push to (typically the current branch — do NOT create a new branch in the parent repo)

## Procedure

1. `git add {paths}`.
2. `git commit -s -m '{message}'`.
3. `git push origin {branch}`.

## Errors

### uncommitted_changes

**Cause:** Changes exist but the user has not requested a commit.

**Recovery:** Report the changes and wait for user direction.

### destructive_operation

**Cause:** Agent attempted a destructive git operation.

**Recovery:** Stop immediately. Ask for explicit user confirmation with clear consequences.
