---
metadata:
  version: 5.3.0
---

## Capability

Version-control operations for planning folders and artifacts — parent repos, submodules, and branch push. Owns the host-versus-component distinction that keeps a session bound to the repository git resolves rather than one prose names.

## Rules

### no-destructive-ops

NEVER run destructive or irreversible operations (force push to protected branches, hard resets) without explicit user request.

### no-hook-skipping

NEVER skip hooks (`--no-verify`, `--no-gpg-sign`) unless the user explicitly requests it.

### explicit-commit

NEVER commit changes unless the user explicitly asks. Verify the request before executing. Scope: ad-hoc commits only — distinct from [commit-after-activity](../workflow-engine/commit-and-persist.md#commit-after-activity), which mandates commit+push after each completed activity, and from any bound operation whose own rules mandate a commit as the value it produces.

### read-agents-md

BEFORE committing engineering artifacts, ALWAYS read `.engineering/AGENTS.md` for the definitive git structure.

### conventional-commits

Follow Conventional Commits: `type(optional-scope): description`. Common types: feat, fix, docs, style, refactor, test, chore, build, ci. Reference issue numbers when applicable.

### dco-sign-off

All commits made via this technique use `git commit -s`. The `Signed-off-by` trailer is required by DCO and harmless when not. Adding it by default avoids the failure-then-retry pattern when target repos enforce DCO via a pre-commit hook.

### infrastructure-submodule-paths

A submodule is infrastructure when its `path` equals `workflows`, equals `.engineering`, or starts with `.engineering/`. Infrastructure submodules are never target components and never classify a repo as a monorepo on their own.

### host-is-derived-component-is-named

The host repository a session belongs to and the component being worked on are two facts, never one variable. The host is DERIVED from git by [resolve-host-repo](./resolve-host-repo.md) — the outermost superproject that claims the workspace checkout — and lands as `{host_repo_path}` and `{target_repo}`. A repository named in the user's request, such as the `owner/repo` in a PR or issue URL, identifies the COMPONENT and lands as `{mentioned_repo}`; it is component context for [select-target-component](./select-target-component.md) alone and never binds the session. Binding a session to a repository merely because the request mentioned it is what produces a checkout that does not exist.
