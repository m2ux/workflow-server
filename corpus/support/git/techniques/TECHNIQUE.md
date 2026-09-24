---
metadata:
  version: 5.9.0
---

## Capability

Git operations for planning folders and artifacts — parent repos, submodules, and branch push. Owns the host-versus-component distinction: host path and `owner/repo` come from git; a repository name in request prose identifies a component only.

## Inputs

### planning_folder_path

Path to the session's planning folder, as the server returned it. Operations that derive a path from where the session keeps its artifacts take it from here; not every operation needs one.

## Rules

### host-shell-for-remote-git

Every git invocation that contacts a remote (`fetch`, `pull`, `push`, `ls-remote`, network `clone`, and `ssh` to the git host) runs on the host shell — host credentials, host network, and host SSH agent. Isolated execution environments that block those are outside this technique. Local-only git may use the default shell. An isolation denial is not a credential or key failure.

### git-configuration-is-user-owned

Git configuration belongs to the user. A validate action names the misconfiguration it found and stops there; it never prescribes a config-changing command. The user fixes their own environment, at whatever scope (system, global, local) they prefer.

### no-destructive-ops

NEVER run destructive or irreversible operations (force push to protected branches, hard resets) without explicit user request.

### no-hook-skipping

NEVER skip hooks (`--no-verify`, `--no-gpg-sign`) unless the user explicitly requests it.

### explicit-commit

NEVER commit changes unless the user explicitly asks. Verify the request before executing. Scope: ad-hoc commits only — distinct from `commit-and-persist.commit-after-activity`, which mandates commit+push after each completed activity, and from any bound operation whose own rules mandate a commit as the value it produces.

### read-agents-md

BEFORE committing engineering artifacts, ALWAYS read `.engineering/AGENTS.md` for the definitive git structure.

### conventional-commits

Follow Conventional Commits: `type(optional-scope): description`. Common types: feat, fix, docs, style, refactor, test, chore, build, ci. Reference issue numbers when applicable.

### dco-sign-off

All commits made via this technique use `git commit -s`. The `Signed-off-by` trailer is required by DCO and harmless when not. Adding it by default avoids the failure-then-retry pattern when target repos enforce DCO via a pre-commit hook.

### infrastructure-engineering-path

A path is the engineering tree when it equals `.engineering` or starts with `.engineering/`.

### infrastructure-submodule-paths

A submodule is infrastructure when its path is an infrastructure engineering path, or its path equals `workflows`. Infrastructure submodules are never target components and never classify a repo as a monorepo on their own.

### host-is-derived-component-is-named

Host repository and component under work are two facts, never one variable. A repository named in the request identifies the component; it never substitutes for the host. Treating a prose-named repository as the host is what produces a checkout that does not exist.
