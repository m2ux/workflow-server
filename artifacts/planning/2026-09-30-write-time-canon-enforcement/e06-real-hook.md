# Real edit guard

Script from `i09/workspace` at `e50ec767`. Guards from `i09/main` at `7dc26dba`, passed as `--server`. Corpus worktree at `7fae6cb3`, whose branch point is `origin/i09/workflows` at that commit.

An edit of `README.md`, which is not a corpus definition, exits 0 with empty stderr.

Removing the Fires-on line under `AP-01. no-inline-content` exits 2. Stderr names one guard, `fires-on-ids`, introduced against `origin/i09/workflows @ 7fae6cb3739b`, and the finding `'AP-01. no-inline-content' carries no Fires-on line`. The file was restored.

A local commit that already lacked that line was then the branch point. Editing the same file exits 0 with empty stderr. The remote-tracking ref was put back to `7fae6cb3` and the worktree reset there.
