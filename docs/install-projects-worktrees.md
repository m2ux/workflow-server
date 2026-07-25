# Install layout: projects + nested worktrees

## Goal

Product **source checkouts** live under a configurable **`HOST_PROJECTS_ROOT`**
(not necessarily under `$INSTALL`). Every project uses the same shape. Feature
worktrees live **only** in a gitignored **`.worktrees/`** directory inside that
checkout. Workflow **definitions** remain a separate clone under `$INSTALL/workflows`.

`$INSTALL/worktrees/` is **deprecated** and must not be used for new feature trees.

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

## Deprecated install co-location

Older installs used `$INSTALL/projects/<owner>/<repo>` and `$INSTALL/worktrees/<owner>/<repo>`.
Do **not** create new trees there. Operators may delete `$INSTALL/worktrees` after
migrating feature worktrees under each checkout’s `.worktrees/`.

| Deprecated | Prefer |
|------------|--------|
| `$INSTALL/projects/<o>/<r>/` | `$HOST_PROJECTS_ROOT/<repo>/` |
| `$INSTALL/worktrees/<o>/<r>/<slug>/` | `$HOST_PROJECTS_ROOT/<repo>/.worktrees/<slug>/` |
| `HOST_WORKTREE_ROOT` as a global feature-tree root | Nested `.worktrees/` only |

## Lifecycle

### Product checkouts (you)

workflow-server does **not** manage product git clones. `init-repo.sh` is
**deprecated** and exits with an error. You own:

```bash
git clone … "$HOST_PROJECTS_ROOT/<repo>"
# inside that checkout:
./deploy.sh   # from workflow-server scripts — creates .engineering/
```

### install.sh

- Create `state/`; clone global `workflows/` on the `workflows` branch.
- Write `env` with **`HOST_PROJECTS_ROOT`** (default may still be `$INSTALL/projects`
  for greenfield installs that have not opted out).
- **Do not** clone product repos or ship `init-repo.sh`.
- **Do not** require or default a separate `$INSTALL/worktrees` root when using
  nested worktrees. If `HOST_WORKTREE_ROOT` is unset, start.sh treats the
  projects root as the bind that covers nested `.worktrees/`.
- Optional `--projects-root=PATH` → external root (e.g. `~/projects/dev`).

### start.sh (Docker)

- Mount `HOST_PROJECTS_ROOT` RW (covers checkouts, `.engineering`, nested `.worktrees`).
- Mount `workflows/` RO, `state/` RW.
- If `HOST_WORKTREE_ROOT` is set and differs from projects root, mount it as well
  (legacy). Prefer leaving it unset.
- `WORKFLOW_SERVER_ENGINEERING_DIR` → projects multi-root base inside the container.

### Feature worktrees (agents)

```bash
git -C "$HOST_PROJECTS_ROOT/my-app" worktree add -b "$branch" \
  "$HOST_PROJECTS_ROOT/my-app/.worktrees/$slug" "origin/$default_branch"
```

Ensure `.worktrees/` is listed in the project’s `.gitignore`.

## Cursor example roots

Four navigation roots (see `examples/cursor-workspace/`):

```text
kickoff/                                      # rules + MCP
$HOST_PROJECTS_ROOT/<repo>                    # project
$HOST_PROJECTS_ROOT/<repo>/.engineering       # planning
$HOST_PROJECTS_ROOT/<repo>/.worktrees         # feature trees
```

## Success criteria

- Checkouts live under `HOST_PROJECTS_ROOT/<repo>` (basename layout), managed by you.
- Sessions plan under `<repo>/.engineering/artifacts/planning/` when eng is present.
- Feature worktrees **only** under `<repo>/.worktrees/<slug>/`.
- No new paths under `$INSTALL/worktrees`.
- No `init-repo.sh` in the install lifecycle.
- Global `$INSTALL/workflows` still serves definitions.
