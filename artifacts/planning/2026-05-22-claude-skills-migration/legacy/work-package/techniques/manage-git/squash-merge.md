# squash-merge

Perform a local signed squash merge into the default branch — used when the GitHub web UI squash flow cannot produce a GPG-signed merge commit.

## Inputs

- **target_path** — The working directory (worktree)
- **branch_name** — Feature branch to squash-merge
- **default_branch** — Default branch name (typically `main`)
- **pr_number** — PR number, used in the merge commit message
- **type** — Commit type prefix (feat / fix / chore / docs / etc.)
- **description** — One-line description for the merge commit message

## Procedure

1. From `target_path`, check out and update the default branch: `git checkout {default_branch} && git pull`.
2. Squash all branch commits onto the default branch: `git merge --squash {branch_name}`.
3. Commit with Signed-off-by and GPG signature: `git commit -s -S -m "{type}: {description} (#{pr_number})"`.
4. Push the merge commit: `git push`.
