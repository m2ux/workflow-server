# Install layout: projects + nested worktrees

## Goal

Product **source checkouts** live under a configurable **`HOST_PROJECTS_ROOT`**
(not necessarily under `$INSTALL`). Every project uses the same shape. Feature
worktrees live **only** in a gitignored **`.worktrees/`** directory inside that
checkout. Workflow **definitions** remain a separate clone under `$INSTALL/workflows`.

## Preferred layout (Layer A / external projects root)

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
| `$HOST_PROJECTS_ROOT/<repo>/` | Checkout / `repo_root` — primary source |
| `$HOST_PROJECTS_ROOT/<repo>/.engineering/` | Planning root (`artifacts/planning/…`) |
| `$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/` | **Only** allowed feature worktree path |
| `$INSTALL/workflows/` | Workflow YAML library for the server (not per-product) |

Uniform formula:

```text
checkout    = $HOST_PROJECTS_ROOT / <repo>
planning    = checkout / .engineering / …
target_path = checkout / .worktrees / <slug>
```

## Lifecycle

### install.sh

- Create `state/`; clone global `workflows/` on the `workflows` branch.
- Write `env` with **`HOST_PROJECTS_ROOT`** (default **`~/projects/dev`**).
- Does not clone product repos.
- If `HOST_WORKTREE_ROOT` is unset, start.sh treats the projects root as the
  bind that covers nested `.worktrees/`.
- Optional `--projects-root=PATH` overrides the default projects root.

### start.sh (Docker)

- Mount `HOST_PROJECTS_ROOT` RW (covers checkouts, `.engineering`, nested `.worktrees`).
- Mount `workflows/` RO, `state/` RW.
- Prefer leaving `HOST_WORKTREE_ROOT` unset (nested `.worktrees/` under projects root).
- `WORKFLOW_SERVER_ENGINEERING_DIR` → projects multi-root base inside the container.

### Feature worktrees (agents)

```bash
git -C "$HOST_PROJECTS_ROOT/my-app" worktree add -b "$branch" \
  "$HOST_PROJECTS_ROOT/my-app/.worktrees/$slug" "origin/$default_branch"
```

Ensure `.worktrees/` is listed in the project’s `.gitignore`.

## Cursor example roots

Five navigation roots (see `examples/cursor-workspace/`):

```text
kickoff/                                              # rules + MCP (📦 workspace)
$HOST_PROJECTS_ROOT/<repo>                            # 📦 project
$HOST_PROJECTS_ROOT/<repo>/workflows                  # 📦 workflows (when present)
$HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning  # 📦 planning
$HOST_PROJECTS_ROOT/<repo>/.worktrees                 # 📦 work trees
```

## Success criteria

- Checkouts live under `HOST_PROJECTS_ROOT/<repo>` (basename layout).
- Sessions plan under `<repo>/.engineering/artifacts/planning/` when eng is present.
- Feature worktrees **only** under `<repo>/.worktrees/<slug>/`.
- Global `$INSTALL/workflows` still serves definitions.
