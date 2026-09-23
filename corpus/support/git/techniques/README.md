# Git Techniques

Git operations for planning folders and artifacts — parent repos, submodules, and branch push.

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`commit-regular-files`](commit-regular-files.md) | Stage, commit, and push files in a regular (non-submodule) directory of the parent repo |
| [`commit-submodule`](commit-submodule.md) | Commit and push inside a submodule and sync the parent's submodule pointer |
| [`create-worktree`](create-worktree.md) | Working directory materialised as a git worktree of the component, on either a feature branch created fresh or an existing branch checked out |
| [`derive-workflows-target-path`](derive-workflows-target-path.md) | Where a session editing the shared workflows library reads, edits and commits, derived from the planning folder that session already has |
| [`identify-path-type`](identify-path-type.md) | Determine whether a path is a regular directory or a git submodule before committing |
| [`list-components`](list-components.md) | The components a host declares as submodules, each with its infrastructure mark and whether a clone has populated its tree |
| [`merge-branches`](merge-branches.md) | Bring the branches an isolated fan committed back onto one branch, in a stated order, reporting what merged cleanly and what did not |
| [`pin-revision`](pin-revision.md) | Checkout brought to a named revision — a commit, a tag, or a branch — detached at the commit that name resolves to, answering the commit landed or the refusal that left it as it stood |
| [`push-branch`](push-branch.md) | Push a local branch to its remote without staging or committing |
| [`read-working-state`](read-working-state.md) | What a working tree holds that its repository does not record, read without writing anything |
| [`reset-checkout`](reset-checkout.md) | Working tree returned to what its repository records, answering what the reset discarded |
| [`resolve-host-repo`](resolve-host-repo.md) | Outermost git host repository for a workspace path, derived from git rather than from prose |
| [`three-dot-name-status`](three-dot-name-status.md) | Three-dot merge-base change surface for a working tree: name-status and per-file line counts against a base ref |
