---
metadata:
  version: 1.0.0
---

## Capability

Two-step submodule commit: commit + push inside the submodule, then update the parent's submodule pointer.

## Inputs

### submodule_path

Path of the submodule from the repo root (e.g., `workflows`, `.engineering/workflows`)

### paths

Array of file paths inside the submodule

### submodule_message

Conventional Commits message for the submodule commit

### parent_branch

Branch to push the parent commit to

## Protocol

1. Read `{submodule_path}/AGENTS.md` (when present). If it forbids Co-Authored-By, LLM attribution, or similar trailers, strip them from `{submodule_message}` BEFORE committing — fixing it after commit usually requires a force push, which this technique forbids.
2. `cd {submodule_path}`.
3. `git add {paths} && git commit -s -m '{submodule_message}' && git push origin <submodule-branch>`.
4. `cd` back to the repo root.
5. `git add {submodule_path}`.
6. `git commit -s -m 'chore: update {submodule_path} submodule'`.
7. `git push origin {parent_branch}`.

The submodule push (step 3) MUST complete before the parent commit (step 6). Skipping step 6 leaves the parent pointing at the old submodule commit. Skipping the submodule push leaves the parent pointing at a commit that does not exist on the remote.

## Errors

### submodule_desync

**Cause:** Parent points to a submodule commit that does not exist on the remote.

**Recovery:** `cd` into the submodule and push the missing commit, then verify the parent pointer resolves.

### stale_pointer

**Cause:** Submodule committed but parent pointer not updated.

**Recovery:** `cd` to repo root, `git add` the submodule path, commit, and push.
