---
metadata:
  version: 1.0.0
---

## Capability

Two-step submodule commit: commit + push inside the submodule, then update the parent's submodule pointer.

## Inputs

### submodule-path

Path of the submodule from the repo root (e.g., `workflows`, `.engineering/workflows`)

### paths

Array of file paths inside the submodule

### submodule-message

Conventional Commits message for the submodule commit

### submodule-branch

Branch to push the submodule commit to

### parent-branch

Branch to push the parent commit to

## Protocol

1. Read `{submodule-path}/AGENTS.md` (when present). If it forbids Co-Authored-By, LLM attribution, or similar trailers, strip them from `{submodule-message}` BEFORE committing — fixing it after commit usually requires a force push, which this technique forbids.
2. `cd {submodule-path}`.
3. `git add {paths} && git commit -s -m '{submodule-message}' && git push origin {submodule-branch}`. This push MUST complete before the parent commit; if it is skipped, the parent will point to a submodule commit that does not exist on the remote (desync). If you discover the parent already references an unpushed submodule commit, `cd` into the submodule and push the missing commit, then verify the parent pointer resolves.
4. `cd` back to the repo root.
5. `git add {submodule-path}`.
6. `git commit -s -m 'chore: update {submodule-path} submodule'`. Steps 5-6 update the parent pointer; if they are skipped, the submodule is committed but the parent still points at the old submodule commit (stale pointer). To fix, `cd` to repo root, `git add` the submodule path, commit, and push.
7. `git push origin {parent-branch}`.
