# Install layout: projects and nested worktrees

Three kinds of directory have to sit somewhere both an agent and the server can reach: the source checkout of each product repository, the planning and session state belonging to it, and the feature worktrees a run creates while it works. This page says where each one goes, and what puts it there.

Every project takes the same shape. One configurable root holds all the checkouts; each checkout holds its own planning root and its own worktrees; and the workflow definitions sit apart from all of it, in the install directory. Three paths follow from that:

```text
checkout    = $HOST_PROJECTS_ROOT / <repo>
planning    = checkout / .engineering / …
target_path = checkout / .worktrees / <slug>
```

`HOST_PROJECTS_ROOT` is configurable and need not sit under the install directory. `<repo>` is the repository's basename rather than its `owner/repo` form. Feature worktrees go in a gitignored `.worktrees/` directory inside the checkout they belong to and nowhere else, which is what keeps a run's scratch trees from scattering across the filesystem.

## The layout

```text
$HOST_PROJECTS_ROOT/                 # e.g. ~/projects/dev  (from $INSTALL/env)
├── <repo>/                          # basename only — not owner/repo
│   ├── .engineering/                # submodule / planning root (when present)
│   └── .worktrees/
│       └── <wp-slug>/               # feature worktree of this checkout
└── workflow-server/                 # same class as any other project
    ├── .engineering/
    └── .worktrees/<slug>/

$INSTALL/                            # default: ~/.local/share/workflow-server
├── env                              # HOST_PROJECTS_ROOT=…  (no HOST_WORKTREE_ROOT)
├── state/
├── start.sh  stop.sh  update-workflows.sh
└── workflows/                       # definitions branch (server WORKFLOW_DIR)
```

| Path | Role |
|------|------|
| `$HOST_PROJECTS_ROOT/<repo>/` | The checkout, and the primary source an agent reads |
| `$HOST_PROJECTS_ROOT/<repo>/.engineering/` | The planning root, holding `artifacts/planning/…` |
| `$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/` | The only permitted location for a feature worktree |
| `$INSTALL/workflows/` | The workflow definitions the server loads, shared across every product |

## What install.sh creates

The installer creates `state/` and clones the definitions into `workflows/` on the `workflows` branch. It writes an `env` file recording `HOST_PROJECTS_ROOT`, which defaults to `~/projects/dev` and can be set with `--projects-root=PATH`.

It does not clone any product repository — those are yours to check out under the projects root.

`HOST_WORKTREE_ROOT` is left unset, and leaving it that way is the intent: with no separate worktree root, `start.sh` treats the projects root as the one bind that already covers every nested `.worktrees/` directory.

## What start.sh mounts

Before booting the container, `start.sh` refreshes the definitions in `$INSTALL/workflows` through `update-workflows.sh`. That step is best-effort: if the machine is offline, or the checkout is dirty or missing, it warns and the server starts on whatever definitions are already on disk. Pass `--no-update-workflows`, or set `WORKFLOW_SERVER_UPDATE_WORKFLOWS=0`, to skip it.

It then mounts `HOST_PROJECTS_ROOT` read-write, which in one bind covers the checkouts, their planning roots and their nested worktrees. The definitions are mounted read-only and `state/` read-write. `WORKFLOW_SERVER_ENGINEERING_DIR` names the projects multi-root base as the container sees it.

## Adding a feature worktree

An agent creates a feature worktree inside the checkout it is working on:

```bash
git -C "$HOST_PROJECTS_ROOT/my-app" worktree add -b "$branch" \
  "$HOST_PROJECTS_ROOT/my-app/.worktrees/$slug" "origin/$default_branch"
```

List `.worktrees/` in the project's `.gitignore`, so the trees a run creates never show up as untracked files in the checkout that hosts them.

## The Cursor workspace roots

A deployed Cursor workspace opens four roots, which map onto the layout above:

```text
kickoff/                                              # rules + MCP + Claude baseline (🏠 workspace)
$HOST_PROJECTS_ROOT/<repo>                            # 📂 project
$HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning  # 📋 planning
$HOST_PROJECTS_ROOT/<repo>/.worktrees                 # 🌳 work trees
```

`deploy-cursor-workspace.sh` expands those roots to absolute `$HOME/…` paths in the generated `.code-workspace` file. Under the kickoff directory it also installs `scripts/claude/` and writes a workspace-local `.claude/settings.json`. The deploy itself is covered in [ide-setup.md](ide-setup.md) and in the [template's README](../examples/cursor-workspace/README.md).

## Checking the layout

A correct install has checkouts under `HOST_PROJECTS_ROOT/<repo>` by basename, sessions planning under `<repo>/.engineering/artifacts/planning/` wherever an engineering root is present, feature worktrees only under `<repo>/.worktrees/<slug>/`, and the definitions still served from the shared `$INSTALL/workflows`.
