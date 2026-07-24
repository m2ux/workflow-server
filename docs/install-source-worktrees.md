# Install layout: source + eng-in-source + worktrees

**Status:** Implementation  
**Date:** 2026-07-24  
**Branch:** `feat/install-source-worktrees`

## Goal

Every managed product repo under the workflow-server install root gets a **main/default-branch checkout** used as the git reference for feature worktrees. Engineering planning lives in that checkout’s **`.engineering` submodule** (initialized on init). Feature worktrees stay in a **sibling** install tree. Global workflow **definitions** remain a separate install clone.

## Layout

```text
$INSTALL/   # default: ~/.local/share/workflow-server
├── env
├── state/
├── start.sh  stop.sh  update-workflows.sh  init-repo.sh
├── workflows/                         # definitions branch (server WORKFLOW_DIR)
├── source/
│   └── <owner>/<repo>/                # full app clone @ default branch
│       └── .engineering/              # submodule (or materialised eng) — planning root
└── worktrees/
    └── <owner>/<repo>/
        └── <wp-slug>/                 # git worktree of source (feature branch)
```

| Path | Role |
|------|------|
| `$INSTALL/source/<o>/<r>/` | `reference_path` — primary checkout; base for `git worktree add` |
| `$INSTALL/source/<o>/<r>/.engineering/` | Session / planning root (`artifacts/planning/…`) |
| `$INSTALL/worktrees/<o>/<r>/<slug>/` | Feature edit worktrees |
| `$INSTALL/workflows/` | Workflow YAML library for the server (not per-product) |

**Removed as first-class roots:** `$INSTALL/engineering/`, `$INSTALL/workspace/` (rename → `worktrees/`; eng moves under source).

## Non-goals

- Do **not** init product `workflows` submodules under source by default (server uses global `$INSTALL/workflows`).
- Do **not** put feature worktrees inside `source/` (branch/worktree isolation).
- Do **not** require a developer `~/projects/main/…` checkout for worktree creation.

## Lifecycle

### install.sh

- Create empty `source/`, `worktrees/`, `state/`.
- Clone global `workflows/` on the `workflows` branch.
- Write `env`: `HOST_SOURCE_ROOT`, `HOST_WORKTREE_ROOT`, install dir, port, container name.
- Do not clone a single top-level source without `owner/repo`.

### init-repo.sh owner/repo

1. Clone/ensure `$INSTALL/source/<o>/<r>` on the default branch (**no** bulk submodule init).
2. Materialise engineering at `source/<o>/<r>/.engineering`:
   - Prefer `git submodule update --init -- .engineering` when listed in `.gitmodules`.
   - Else existing resolution (eng branch clone into `.engineering`, or in-tree extract).
3. `mkdir -p $INSTALL/worktrees/<o>/<r>/`.

### update-workflows.sh

1. Ff-only update global `$INSTALL/workflows`.
2. For each `$INSTALL/source/*/*` git checkout: fetch + ff default branch; refresh `.engineering` when it is a git/submodule checkout (dirty / `--force` policy aligned with workflows).

### start.sh (Docker)

- Mount `source/` RW, `worktrees/` RW, `workflows/` RO, `state/` RW.
- `WORKTREE_ROOT` / workspace multi-root → `$INSTALL/worktrees`.
- `WORKFLOW_SERVER_ENGINEERING_DIR` multi-root → `$INSTALL/source` (per-repo eng = `source/<o>/<r>/.engineering`).

## Server multi-root

| Before | After |
|--------|--------|
| `$INSTALL/engineering/<o>/<r>/artifacts/planning/` | `$INSTALL/source/<o>/<r>/.engineering/artifacts/planning/` |
| Multi-root base = `$INSTALL/engineering` | Multi-root base = `$INSTALL/source` |
| Feature parent = `$INSTALL/workspace/<o>/<r>/` | `$INSTALL/worktrees/<o>/<r>/` |

`start_session({ repo: "owner/repo" })` unchanged at the API; path math updates only.

Legacy: if `$INSTALL/engineering` is still bound as multi-root, resolve eng as `engineering/<o>/<r>` (no `.engineering` suffix) for one-release migration.

## Agent bindings

| Variable | Value |
|----------|--------|
| `reference_path` | `$INSTALL/source/<o>/<r>` |
| Planning | via server under `…/.engineering/artifacts/planning/` |
| `target_path` | `$INSTALL/worktrees/<o>/<r>/<wp-slug>/` |

```bash
git -C "$INSTALL/source/acme/app" worktree add -b "$branch" \
  "$INSTALL/worktrees/acme/app/$slug" "origin/$default_branch"
```

## Cursor example roots

```text
kickoff/
$INSTALL/source/<owner>/<repo>
$INSTALL/worktrees/<owner>/<repo>
```

## Migration

1. Rename `workspace` → `worktrees` (or symlink one release).
2. For each old `engineering/<o>/<r>`: ensure `source/<o>/<r>`, init/populate `.engineering`, copy unpushed planning if needed.
3. Point env/start at `source` + `worktrees`.
4. Restart container; fix IDE workspace paths.

## Success criteria

- `init-repo o/r` yields source main checkout, `.engineering` planning root, and worktrees parent.
- Sessions plan under `source/…/.engineering/artifacts/planning/`.
- Feature worktrees only under `worktrees/…`, created from `source/…`.
- Global `$INSTALL/workflows` still serves definitions.
- Product `workflows` submodule not required at init.
