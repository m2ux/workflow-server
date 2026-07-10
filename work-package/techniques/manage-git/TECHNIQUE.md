---
metadata:
  version: 2.1.0
---

## Capability

Manage git operations — branching, worktree lifecycle, PR lifecycle, branch synchronization, reference-repo submodule maintenance, and pre-push verification of the configured push remote (privacy and signature checks for stealth-mode consumers).

## Inputs

### reference_path

Path to the reference checkout (the engineering / parent repo where planning artifacts and submodule references live)

## Rules

### directory-scope

Edit-side git operations (branch, PR, sync, push) run inside `{target_path}`. Reference-side git operations (submodule update, artifact commits) run inside `{reference_path}`. Branches and PRs are created against the target's upstream.

### code-commit-coauthor-trailer

Every code commit (NOT artifact commits) MUST carry a `Co-authored-by: {display_name} <{email}>` trailer so GitHub renders both the human and the assistant in the commit byline. Whether to add it manually depends on the harness: Claude Code adds it automatically — do NOT add it again or it will appear twice. Other assistants that do not auto-inject the trailer must add it explicitly via `git commit -m "subject\n\nCo-authored-by: {display_name} <{email}>"`. Known assistant identity for the Claude Code harness: `Co-authored-by: Claude <noreply@anthropic.com>` (auto-injected). For other assistants, use the identity provided by their harness or documentation.
