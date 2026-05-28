---
name: version-control
description: Planning-folder initialization and commit operations for regular directories and submodules.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 5.0.0
  order: 2
  legacy_id: 2
---

# Version Control

## Capability

Initialize planning folders and commit artifacts in the parent repository or a submodule — including the two-step submodule commit pattern that keeps parent pointers in sync with submodule HEADs.

## Operations

| Operation | Purpose |
|---|---|
| [detect-repo-type](detect-repo-type.md) | Determine whether the working directory is a regular repo or a submodule monorepo |
| [list-submodules](list-submodules.md) | Read and parse `.gitmodules` to enumerate submodule paths |
| [initialize-folder](initialize-folder.md) | Create a planning folder under `.engineering/artifacts/planning/` |
| [commit-regular-files](commit-regular-files.md) | Stage, commit, and push files in a regular (non-submodule) directory of the parent repo |
| [commit-submodule](commit-submodule.md) | Two-step submodule commit: commit + push inside the submodule, then update the parent's pointer |
| [identify-path-type](identify-path-type.md) | Determine whether a path is a regular directory or a git submodule before committing |

## Rules

### no-destructive-ops

NEVER run destructive or irreversible operations (force push to protected branches, hard resets) without explicit user request.

### no-hook-skipping

NEVER skip hooks (`--no-verify`, `--no-gpg-sign`) unless the user explicitly requests it.

### explicit-commit

NEVER commit changes unless the user explicitly asks. Verify the request before executing.

### read-agents-md

BEFORE committing engineering artifacts, ALWAYS read `.engineering/AGENTS.md` for the definitive git structure.

### conventional-commits

Follow Conventional Commits: `type(optional-scope): description`. Common types: feat, fix, docs, style, refactor, test, chore, build, ci. Reference issue numbers when applicable.

### dco-sign-off

All commits made via this skill use `git commit -s`. The `Signed-off-by` trailer is required by DCO and harmless when not. Adding it by default avoids the failure-then-retry pattern when target repos enforce DCO via a pre-commit hook.

### respect-submodule-agents

[commit-submodule](commit-submodule.md) MUST honour the SUBMODULE's `AGENTS.md` authorial-trailer policy in addition to the parent's. When the submodule forbids Co-Authored-By or similar LLM-attribution trailers, strip them from `{submodule_message}` before invocation. Discovery, not retrofit — fixing it after commit usually requires a force push.
