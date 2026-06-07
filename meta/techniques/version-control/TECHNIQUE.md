---
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

All commits made via this technique use `git commit -s`. The `Signed-off-by` trailer is required by DCO and harmless when not. Adding it by default avoids the failure-then-retry pattern when target repos enforce DCO via a pre-commit hook.
