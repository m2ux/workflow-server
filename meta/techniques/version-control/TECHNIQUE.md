---
metadata:
  version: 5.1.0
---

## Capability

Version-control operations for planning folders and artifacts — parent repos, submodules, and branch push.

## Rules

### no-destructive-ops

NEVER run destructive or irreversible operations (force push to protected branches, hard resets) without explicit user request.

### no-hook-skipping

NEVER skip hooks (`--no-verify`, `--no-gpg-sign`) unless the user explicitly requests it.

### explicit-commit

NEVER commit changes unless the user explicitly asks. Verify the request before executing. Scope: ad-hoc commits outside the orchestrator post-activity hook — distinct from [commit-after-activity](../workflow-engine/commit-and-persist.md#commit-after-activity), which mandates commit+push after each completed activity.

### read-agents-md

BEFORE committing engineering artifacts, ALWAYS read `.engineering/AGENTS.md` for the definitive git structure.

### conventional-commits

Follow Conventional Commits: `type(optional-scope): description`. Common types: feat, fix, docs, style, refactor, test, chore, build, ci. Reference issue numbers when applicable.

### dco-sign-off

All commits made via this technique use `git commit -s`. The `Signed-off-by` trailer is required by DCO and harmless when not. Adding it by default avoids the failure-then-retry pattern when target repos enforce DCO via a pre-commit hook.

### infrastructure-submodule-paths

A submodule is infrastructure when its `path` equals `workflows`, equals `.engineering`, or starts with `.engineering/`. Infrastructure submodules are never target components and never classify a repo as a monorepo on their own.
