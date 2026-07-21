# Agent-Managed Worktrees

The workflow server binds to one required worktree / workspace root at startup and derives planning paths under that root. Agents own Git worktree creation and `.engineering` initialisation; the server validates containment and writes artifacts.

## Required root

Supply exactly one of:

| Source | Notes |
|--------|--------|
| `--workspace=PATH` | Highest precedence |
| `WORKFLOW_WORKSPACE` | Env bind |
| `WORKTREE_ROOT` | Env alias (containers / brief naming) |

`ServerConfig.workspaceDir` stores the resolved absolute path. The server fails fast at startup without a root. HTTP `GET /ready` checks that this path exists (`checks.workspaceDir` in the JSON body).

## Planning slug

| Variable | Default |
|----------|---------|
| `PLANNING_SLUG` | `.engineering/artifacts/planning` |

Derived planning root: `{workspaceDir}/{PLANNING_SLUG}/`. Empty or whitespace `PLANNING_SLUG` falls back to the default. Session folders are `{planningRoot}/{slug}/`.

`start_session` accepts a planning folder slug / hint; the server resolves under the configured planning root (basename-safe). There is no per-call worktree-root tool parameter.

## Agent sequence

1. Identify the target repository.
2. `git worktree add <root>/<run-id>` (under the configured worktree root).
3. Initialise `.engineering` in that worktree.
4. Start the server with the required root.
5. `start_session` with a planning slug / folder hint.
6. Execute the workflow; artifacts are written under the derived planning path.

## Containers

See [`Dockerfile`](../Dockerfile) and [`docker-compose.yml`](../docker-compose.yml):

- Node image only — no Git or SSH in the server image.
- `ENV WORKTREE_ROOT=/worktrees` (and optional `PLANNING_SLUG`).
- RW bind of the host worktree root; workflows/schemas may be RO.
- Align container UID/GID with the host user that creates worktrees so RW writes succeed.

## Path containment

Write-path helpers (e.g. `ensurePlanningFolder`) assert that derived paths stay inside the configured root (separator-aware, with realpath for symlink escape). Errors name the root and guide agents to correct the path or initialise `.engineering` under it.
