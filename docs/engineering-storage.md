# Engineering storage patterns

How product repos store workflow-server engineering content (planning, ADRs, session state). Chosen at deploy time via [`scripts/deploy.sh`](../scripts/deploy.sh) **inside the product checkout you already manage**.

workflow-server does **not** clone or materialise product repos (`init-repo.sh` is deprecated). Keep basename checkouts under `$HOST_PROJECTS_ROOT/<repo>/` yourself; see [setup.md](../setup.md) and [install-projects-worktrees.md](install-projects-worktrees.md).

## Patterns

`deploy.sh` supports three layouts. Pick one per project (or per org convention):

| Pattern | Command | Where engineering history lives |
|---------|---------|----------------------------------|
| **Same-repo orphan** (default) | `./deploy.sh` or `./deploy.sh --orphan` | Orphan branch `engineering` on **this** app remote; app tracks it via a `.engineering` submodule |
| **Shared engineering monorepo** | `./deploy.sh --orphan <engineering-remote-url>` | **External** engineering remote; one **project-named branch** per app (branch name = project directory basename). Many product repos share one engineering remote; each keeps planning/ADRs on its own branch |
| **In-branch** | `./deploy.sh --in-branch` | `.engineering/` as ordinary files on the current app branch (no orphan/submodule) |

### Same-repo orphan (default)

Best when a single product repo owns its engineering history.

1. Clone the app under `$HOST_PROJECTS_ROOT/<repo>/` (basename) yourself.
2. Run `./deploy.sh` (or `./deploy.sh --orphan`) from the app root.
3. Creates orphan branch `engineering` on the app remote and adds `.engineering` as a submodule on the default branch. Planning lives at `<checkout>/.engineering/`.

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
- After deploy, open/update the `.engineering` submodule in **your** checkout as usual (`git submodule update --init -- .engineering`).

### In-branch

Best for simple or experimental setups without orphan branches or submodules.

1. Run `./deploy.sh --in-branch` in your product checkout.
2. `.engineering/` lives as ordinary files on the current app branch.

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

See [setup.md §2](../setup.md#2-prepare-a-target-project). Artifact boundaries and git procedures: [artifact_management_model.md](artifact_management_model.md).
