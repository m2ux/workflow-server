---
metadata:
  version: 2.2.0
---

## Capability

Git operations supporting work-package delivery — worktrees, path restore from a base ref, edit-side commits, branch sync, repo-root submodule maintenance, and pre-push destination/signature checks.

## Inputs

### host_repo_path

Path to the product repo root (monorepo or standalone). Submodule refresh runs here; planning artifact commits may run in `{host_repo_path}/.engineering` when that path is a git checkout.


## Rules

### directory-scope

Edit-side git operations (branch, PR, sync, push) run inside `{target_path}`. Submodule refresh runs inside `{host_repo_path}`. Planning artifact commits run in `{host_repo_path}/.engineering` when that path is a git checkout, otherwise `{host_repo_path}`. Branches and PRs are created against the target's upstream.

### code-commit-coauthor-trailer

Every code commit (NOT artifact commits) MUST carry a `Co-authored-by: {display_name} <{email}>` trailer so GitHub renders both the human and the assistant in the commit byline. Whether to add it manually depends on the harness: Claude Code adds it automatically — do NOT add it again or it will appear twice. Other assistants that do not auto-inject the trailer must add it explicitly via `git commit -m "subject\n\nCo-authored-by: {display_name} <{email}>"`. Known assistant identity for the Claude Code harness: `Co-authored-by: Claude <noreply@anthropic.com>` (auto-injected). For other assistants, use the identity provided by their harness or documentation.

### host-shell-for-remote-git

Run every git invocation that contacts a remote (`fetch`, `pull`, `push`, `ls-remote`, network `clone`, and `ssh` to the git host) in a shell with full host permissions (Cursor Shell `required_permissions: ["all"]`, or the harness equivalent outside the agent sandbox). Local-only git may use the default shell. Sandbox-denial signatures (`Bad owner or permissions on …/ssh_config.d/…`, TCP via `127.0.0.1`, connection reset / `unexpected EOF` to the git host) mean re-run once under full host permissions — not that credentials or keys failed.
