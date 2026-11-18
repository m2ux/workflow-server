---
name: server-in-the-loop
description: >-
  Runs a workflow-server experiment sidecar as server-in-the-loop validation:
  reload and cycle a live HTTP instance on port 32772, author specimen
  workflows, and walk them against codebase and corpus changes. The first live
  walk is always a minimum viable workflow (MVW): one orchestrator, one
  activity, one routine, one technique. Use after unit, e2e and guard tests on
  a system change once the user agrees to a live sidecar loop, or when the user
  names the sidecar, workflow-server-exp, specimen validation, live-instance
  walk, MVW, or server-in-the-loop. Ordinary start, create, and resume
  work-package requests stay on the install instance.
---

# Server in the Loop

A live sidecar walks real workflow traffic to validate codebase changes, corpus changes, or both. Specimen workflows are the vehicle. The first live walk is always a **minimum viable workflow (MVW)** so a broken engine is visible before anyone pays for a change-surface walk.

- The `workflow-server-exp` sidecar and its MCP tools
- The engine and corpus trees it serves
- The MVW and change-surface specimen workflows

## Modes

- **[Loop](references/loop-mode.md)**
  - Forward-looking, scoped to one system change
  - Running a live sidecar loop after unit, e2e and guard tests
  - Specimen validation of a codebase or corpus change
  - An MVW walk on workflow-server-exp

## Rules

- **Interface.**
  HTTP is the transport; it is not the interface. **The walk is driven through the sidecar's MCP tools**, as [Reach the Instance Through MCP](references/loop-mode.md#reach-the-instance-through-mcp) states.
- **Sources.**
  Bootstrap steps come from `discover`; reload flags live in `http.md` and `tests/scripts/reload-exp-sidecar.sh`. Cite those, do not copy them.
- **Pairing.**
  Never pass `--name=workflow-server` or `--host-port=3000`; the reload script refuses both. Cursor may namespace tools as `user-workflow-server-exp`. A `session_index` is valid on one instance only.
- **Shared dest.**
  Never bind the shared `.worktrees/workflows` dest.

## Conventions

### Fixed Pairing

| Piece | Value |
|-------|--------|
| Container name | `workflow-server-exp` |
| Host port | `32772` (stable; Cursor keeps the MCP URL) |
| MCP config name | `workflow-server-exp` |
| MCP URL | `http://127.0.0.1:32772/mcp` |
| Isolated projects root | `$XDG_DATA_HOME/workflow-server/exp-projects` |
| Session `working_directory` | `<projects-root>/workflow-server`, a stable clone the agent creates |
| HMAC state | `$XDG_DATA_HOME/workflow-server/state`, shared with the install instance |
| Install instance | `workflow-server` on `:3000`, out of scope here |

### Trees Under Test

| Bind | Tree | Role |
|------|------|------|
| `--build` | Engine worktree under test (absolute path) | Host `tsc`; the image rebuilds when lockfile or Dockerfile drifted |
| `--workflows-dir` | Dedicated corpus worktree containing `corpus/` | Definitions served |
| `working_directory` | Stable clone under the isolated projects root | Repo binding |
| Planning root | `<project>/.engineering/artifacts/planning` of the primary project checkout | Session artifacts. Not a worktree, and not the workflow-server local share |

Run the reload script from a checkout whose `http.md` describes host compile. The engine worktree's `node_modules` must match its lockfile or the cycle falls back to an image rebuild. `--no-build` moves only the corpus bind. Definition edits on a mounted tree resolve on the next tool call. Name a pairing with a distinct `--image` tag; later cycles inherit everything and take `--name` alone. Confirm `compile  : host tsc` and no `Building` in the log.

## Dependencies

- **Docker.**  Runs the `workflow-server-exp` container and answers `docker inspect`.
- **Reload script.**
  `tests/scripts/reload-exp-sidecar.sh` in a checkout whose `http.md` describes host compile.
- **Engine checkout.**  `npx tsx` and the engine's `guards/` for the serving check.
- **curl.**  Reads the sidecar's `/ready` endpoint.
- **MCP client.**  An MCP connection named `workflow-server-exp`, reconnected after each reload.
