---
metadata:
  version: 1.0.0
---

## Capability

Query GitHub for the repo's allowed merge strategies (specifically, whether squash merging is enabled).

## Inputs

### component-name

*(optional)* Basename of the component (for monorepo references)

## Output

### squash-merge-available

Boolean — true if the repo allows squash merges

## Protocol

1. Identify the component git directory the same way [create-worktree](./create-worktree.md) does: `reference-path/component-name` when the reference is a monorepo, `reference-path` otherwise. The worktree at `target-path` does not have to exist yet — any checkout of the component repo carries the same remote.
2. Resolve {\$owner-repo} via `git -C {$component-git-dir} remote get-url origin` (convert SSH to HTTPS if needed, strip the `.git` suffix).
3. Query the GitHub API: `gh api repos/{$owner-repo} --jq '{allow_squash_merge}'`.
4. Set `squash-merge-available = true` if `allow_squash_merge` is true; false otherwise.
