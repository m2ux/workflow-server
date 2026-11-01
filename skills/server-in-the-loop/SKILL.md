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

Server in the Loop validates codebase changes, corpus changes, or both by walking real workflow traffic through a live sidecar, with specimen workflows as the vehicle.

- **Change**  The system change under validation, in the engine, the corpus, or both.
- **Claim table**  One row per outcome the change promises, with the fixture case that produces it.
- **Sidecar**  The `workflow-server-exp` instance on port `32772`, reloaded and cycled per loop.
- **Specimens**  The minimum viable workflow (MVW) and a specimen for the change surface.

## Modes

- **[Loop](references/loop-mode.md)**
  - Forward-looking, scoped to one system change and the sidecar walking it
  - Live sidecar validation of a codebase or corpus change
  - Specimen and MVW walks on `workflow-server-exp`
  - Reloading, cycling or stopping the experiment sidecar

## Rules

- **MVW first.**
  The first live walk on an instance is always the MVW, so a broken engine is visible before anyone pays for a change-surface walk. Each cycle opens with it.
- **Walk through MCP.**
  - HTTP is the transport; it is not the interface. Every call that reads or drives the server is an MCP tool call on `workflow-server-exp`.
  - A `curl` walk proves the container answers HTTP and nothing about what an agent receives. Never fall back to HTTP.
- **Install instance out of scope.**
  - The install instance, `workflow-server` on `:3000`, is out of scope; ordinary start, create and resume requests stay on it.
  - Never pass `--name=workflow-server` or `--host-port=3000`; the reload script refuses both.
- **Cite, do not copy.**
  Bootstrap steps come from `discover`; reload flags live in `http.md` and `tests/scripts/reload-exp-sidecar.sh`. Cite those, do not copy them.

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

- Cursor may namespace tools as `user-workflow-server-exp`.
- A `session_index` is valid on one instance only.

## Dependencies

- **Docker**  Runs the sidecar container and image, and carries the corpus and engine pin labels.
- **Reload and stop scripts**
  `tests/scripts/reload-exp-sidecar.sh` brings the sidecar up and cycles it; `$XDG_DATA_HOME/workflow-server/stop.sh` stops it.
- **Node and npm**  Host `tsc` compile of the engine worktree and the `tsx` serving check.
- **MCP client**  Drives every walk through the `workflow-server-exp` MCP config.
- **curl**  The readiness probe of the live instance.
- **Git**  The stable clone and branch worktrees under the isolated projects root.
- **Corpus tree and workflow-canon**
  The corpus tree's `docs/README.md` sets specimen layout; the `workflow-canon` skill sets their quality.
