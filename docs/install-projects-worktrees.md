# Install layout: projects + worktrees

## Goal

Every managed product repo under the workflow-server install root gets a **main/default-branch checkout** used as the git reference for feature worktrees. Engineering planning lives in that checkout’s **`.engineering` submodule** (initialized on init). Feature worktrees stay in a **sibling** install tree. Global workflow **definitions** remain a separate install clone.

## Layout

```text
$INSTALL/   # default: ~/.local/share/workflow-server
├── env
├── state/
├── start.sh  stop.sh  update-workflows.sh  init-repo.sh
├── workflows/                         # definitions branch (server WORKFLOW_DIR)
├── projects/
│   └── <owner>/<repo>/                # full app clone @ default branch
│       └── .engineering/              # submodule (or materialised eng) — planning root
└── worktrees/
    └── <owner>/<repo>/
        └── <wp-slug>/                 # git worktree of projects checkout (feature branch)
```

| Path | Role |
|------|------|
| `$INSTALL/projects/<o>/<r>/` | `repo_root` — primary checkout; base for `git worktree add` |
| `$INSTALL/projects/<o>/<r>/.engineering/` | Session / planning root (`artifacts/planning/…`) |
| `$INSTALL/worktrees/<o>/<r>/<slug>/` | Feature edit worktrees |
| `$INSTALL/workflows/` | Workflow YAML library for the server (not per-product) |

## Non-goals

- Do **not** init product `workflows` submodules under `projects/` by default (server uses global `$INSTALL/workflows`).
- Do **not** put feature worktrees inside `projects/` (branch/worktree isolation).
- Do **not** require a developer `~/projects/main/…` checkout for worktree creation.

## Lifecycle

### install.sh

- Create empty `projects/`, `worktrees/`, `state/`.
- Clone global `workflows/` on the `workflows` branch.
- Write `env`: `HOST_PROJECTS_ROOT`, `HOST_WORKTREE_ROOT`, install dir, port, container name.
- Do not clone a single top-level project without `owner/repo`.

### init-repo.sh owner/repo

1. Clone/ensure `$INSTALL/projects/<o>/<r>` on `--branch=NAME` when set, otherwise the remote default branch (**no** bulk submodule init).
2. Materialise engineering at `projects/<o>/<r>/.engineering`:
   - Prefer `git submodule update --init -- .engineering` when listed in `.gitmodules`.
   - Else existing resolution (`--engineering-branch` / eng branch clone into `.engineering`, or in-tree extract).
3. `mkdir -p $INSTALL/worktrees/<o>/<r>/`.

### update-workflows.sh

1. Ff-only update global `$INSTALL/workflows`.
2. For each `$INSTALL/projects/*/*` git checkout: fetch + ff default branch; refresh `.engineering` when it is a git/submodule checkout (dirty / `--force` policy aligned with workflows).

### start.sh (Docker)

- Mount `projects/` RW, `worktrees/` RW, `workflows/` RO, `state/` RW.
- `WORKTREE_ROOT` / workspace multi-root → `$INSTALL/worktrees`.
- `WORKFLOW_SERVER_ENGINEERING_DIR` multi-root → `$INSTALL/projects` (per-repo eng = `projects/<o>/<r>/.engineering`).

## Server multi-root

| Role | Path |
|------|------|
| Multi-root eng base | `$INSTALL/projects` |
| Per-repo planning | `$INSTALL/projects/<o>/<r>/.engineering/artifacts/planning/` |
| Feature worktree parent | `$INSTALL/worktrees/<o>/<r>/` |

`start_session({ repo: "owner/repo" })` selects the per-repo engineering checkout under `projects/`.

## Agent bindings

| Variable | Value |
|----------|--------|
| `repo_root` | `$INSTALL/projects/<o>/<r>` |
| Planning | via server under `…/.engineering/artifacts/planning/` |
| `target_path` | `$INSTALL/worktrees/<o>/<r>/<wp-slug>/` |

```bash
git -C "$INSTALL/projects/acme/app" worktree add -b "$branch" \
  "$INSTALL/worktrees/acme/app/$slug" "origin/$default_branch"
```

## Cursor example roots

```text
kickoff/
$INSTALL/projects/<owner>/<repo>
$INSTALL/worktrees/<owner>/<repo>
```

## Success criteria

- `init-repo o/r` yields projects main checkout, `.engineering` planning root, and worktrees parent.
- Sessions plan under `projects/…/.engineering/artifacts/planning/`.
- Feature worktrees only under `worktrees/…`, created from `projects/…`.
- Global `$INSTALL/workflows` still serves definitions.
- Product `workflows` submodule not required at init.
