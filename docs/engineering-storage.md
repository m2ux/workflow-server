# Engineering storage patterns

A repository that runs workflows accumulates engineering content — plans, decision records, session state — and where that content lives is a choice worth making deliberately. What suits a single repository owning its own history is not what suits an organisation running a dozen of them, and neither is what suits an experiment. [`scripts/deploy.sh`](../scripts/deploy.sh), run inside the product checkout under your projects root, sets this up, and the install sequence it belongs to is in [setup.md](../setup.md).

## Patterns

`deploy.sh` supports three layouts. Pick one per project, or per organisation convention:

| Pattern | Command | Where engineering history lives |
|---------|---------|----------------------------------|
| **Same-repo orphan** (default) | `./deploy.sh` or `./deploy.sh --orphan` | Orphan branch `engineering` on **this** app remote; app tracks it via a `.engineering` submodule |
| **Shared engineering monorepo** | `./deploy.sh --orphan <engineering-remote-url>` | **External** engineering remote; one **project-named branch** per app (branch name = project directory basename). Many product repos share one engineering remote; each keeps planning/ADRs on its own branch |
| **In-branch** | `./deploy.sh --in-branch` | `.engineering/` as ordinary files on the current app branch (no orphan/submodule) |

### Same-repo orphan (default)

Best when a single product repo owns its engineering history.

1. Keep the app checkout at `$HOST_PROJECTS_ROOT/<repo>/` (basename).
2. Run `./deploy.sh` (or `./deploy.sh --orphan`) from the app root; creates orphan branch `engineering` on the app remote and adds `.engineering` as a submodule on the default branch.
3. Sessions resolve planning under `$HOST_PROJECTS_ROOT/<repo>/.engineering/` when the checkout sits there (see [install-projects-worktrees.md](install-projects-worktrees.md)).

### Shared engineering monorepo

Best for multi-app / monorepo orgs that want one engineering remote and clean product default branches.

- One private (or internal) git remote holds engineering for several product repos.
- Deploy with the external URL:

```bash
./deploy.sh --orphan git@host:org/shared-engineering.git
```

  (URL is yours; not a fixed public repo.)

- The script creates or uses branch `<project-name>` on that remote (basename of the project directory) and wires the app’s `.engineering` submodule to it.
- Sibling apps repeat deploy with the **same** engineering remote; each gets its own branch. History stays out of product default branches.
- Optional history submodule can use the same project-named branch convention (`--history-repo`, `--skip-history`).
- After deploy, open/update the `.engineering` submodule in your checkout (`git submodule update --init -- .engineering`), including **external** remotes.

### In-branch

Best for simple or experimental setups without orphan branches or submodules.

1. Run `./deploy.sh --in-branch`.
2. `.engineering/` lives as ordinary files on the current app branch.
3. No install-side materialisation step — planning uses the in-tree `.engineering/` under the checkout.

## Deploy entry point

From the **root of the target project repo**:

```bash
curl -fsSL -o deploy.sh \
  https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/deploy.sh
chmod +x deploy.sh && ./deploy.sh   # or --orphan / --orphan <url> / --in-branch
```

Full flags: `./deploy.sh --help`.

## After deploy

No install-side materialisation step. Ensure the checkout sits under `$HOST_PROJECTS_ROOT/<repo>/` and pass `repo: "owner/repo"` on `start_session`.

Initialising a target repository is covered in [setup.md](../setup.md#2-initialise-a-target-repo), and the boundaries these layouts exist to keep — what belongs in the engineering tree, what belongs in the feature worktree, and how each is committed — are in [artifact and workspace isolation](artifact-management-model.md).
