---
name: manage-git
description: Git branch, worktree, and PR lifecycle management.
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 2.0.0
  order: 15
  legacy_id: 15
---

# Manage Git

## Capability

Manage git operations — branching, worktree lifecycle, PR lifecycle, branch synchronization, and reference-repo submodule maintenance.

## Operations

| Operation | Purpose |
|---|---|
| [update-reference-submodules](update-reference-submodules.md) | Refresh the monorepo reference's submodules to their tracked remote HEADs (with locking and skip-if-recent) |
| [create-worktree](create-worktree.md) | Materialise a working directory with a feature branch from the component's default branch |
| [remove-worktree](remove-worktree.md) | Tear down a worktree created earlier in the work package |
| [create-pr](create-pr.md) | Open a draft PR linked to the issue, assigned to the current user |
| [sync-branch](sync-branch.md) | Fetch and rebase/merge from main to keep the feature branch current |
| [detect-merge-strategy](detect-merge-strategy.md) | Query GitHub for the repo's allowed merge strategies |
| [squash-merge](squash-merge.md) | Perform a local signed squash merge into the default branch |
| [push-commits](push-commits.md) | Push local commits on the feature branch to the remote |
| [artifact-commits](artifact-commits.md) | Commit planning artifacts to the parent engineering repo with the activity message pattern |

## Rules

### directory-scope

Edit-side git operations (branch, PR, sync, push) run inside `target_path`. Reference-side git operations (submodule update, artifact commits) run inside `reference_path`. Branches and PRs are created against the target's upstream.

### code-commit-coauthor-trailer

Every code commit (NOT artifact commits) MUST carry a `Co-authored-by: {display_name} <{email}>` trailer so GitHub renders both the human and the assistant in the commit byline. Whether to add it manually depends on the harness: Claude Code adds it automatically — do NOT add it again or it will appear twice. Other assistants that do not auto-inject the trailer must add it explicitly via `git commit -m "subject\n\nCo-authored-by: {display_name} <{email}>"`. Known assistant identity for the Claude Code harness: `Co-authored-by: Claude <noreply@anthropic.com>` (auto-injected). For other assistants, use the identity provided by their harness or documentation.
