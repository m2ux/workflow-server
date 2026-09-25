# Manage Git

> Part of [techniques](../README.md)

Shared contract for the work package's git work: which checkout each class of technique runs in, what a code commit carries, and which shell reaches a remote.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`artifact-commits`](artifact-commits.md) | Commit planning artifacts in the engineering checkout with the canonical message pattern, rebasing onto sibling work-package commits to avoid push rejections |
| [`commit-paths`](commit-paths.md) | Stage and commit selected paths on the edit-side feature branch (code commits, not planning-folder artifact commits) |
| [`detect-merge-strategy`](detect-merge-strategy.md) | Query GitHub for the component repository's allowed merge strategies (specifically, whether squash merging is enabled) |
| [`instruct-merge-strategy`](instruct-merge-strategy.md) | Advisory DCO-compliant merge guidance for the PR (read-only |
| [`remove-worktree`](remove-worktree.md) | Tear down a worktree created earlier in the work package |
| [`restore-paths-from-ref`](restore-paths-from-ref.md) | Restore selected worktree paths to match a base git ref (whole file or interactive hunks), then stage the restores |
| [`sync-branch`](sync-branch.md) | Feature branch kept current with the default branch |
| [`update-repo-submodules`](update-repo-submodules.md) | Refresh the monorepo's submodules to their tracked remote HEADs, with locking and skip-if-recent semantics to coordinate concurrent invocations from sibling work packages |
| [`verify-commit-signatures`](verify-commit-signatures.md) | Feature-branch GPG signature hygiene before push — every commit signed |
| [`verify-feature-branch`](verify-feature-branch.md) | Confirmation that the target path is on a feature branch rather than main or master |
| [`verify-remote-private`](verify-remote-private.md) | Configured push remote confirmed private before an upcoming push |
