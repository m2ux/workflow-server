# Setup

Connect an MCP client (Cursor, Claude Desktop, or compatible) to workflow-server.

## 1. Choose a transport

| Path | When | Guide |
|------|------|--------|
| **Docker / HTTP** | Run the GHCR image; no server source checkout | [http.md](http.md) |
| **stdio** | IDE spawns `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

### Installed root paths

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Helper scripts, `env`, workflows clone |
| **Workspace** | `$INSTALL/workspace` | Per-repo feature worktrees |
| **Engineering** | `$INSTALL/engineering` | Per-repo engineering checkouts (planning / sessions) |
| **Workflows** | `$INSTALL/workflows` | Workflow definitions (`workflows` branch) |

> Override roots with `--install-dir`, `--worktree-root`, `--engineering-root` (see `install.sh --help`).

## 2. Init a target repo

Materialise engineering + workspace for each GitHub repo the server should work on:

```bash
~/.local/share/workflow-server/init-repo.sh owner/repo
```

That creates:

- `$INSTALL/engineering/<owner>/<repo>/` — engineering checkout (planning / session state)
- `$INSTALL/workspace/<owner>/<repo>/` — feature worktrees

Repeat for each repo you care about.

Alternatively, from a **project repo root**, [`scripts/deploy.sh`](scripts/deploy.sh) can create an in-tree `.engineering/` for a legacy single-checkout layout.

## 3. Connect the MCP client

Transport-specific client snippets are in [http.md](http.md) and [stdio.md](stdio.md). After the client can reach the server:

1. Restart the IDE (or reload MCP servers).
2. Ask the agent to list available workflows.

HTTP clients typically need:

```bash
export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp
```

(Adjust host/port if you changed `--host-port`.)

## 4. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

## 5. Verify

| Check | How |
|-------|-----|
| HTTP liveness | `curl -fsS http://127.0.0.1:3000/health` → `{"status":"ok"}` |
| HTTP readiness | `curl -fsS http://127.0.0.1:3000/ready` (dirs must exist) |
| MCP | In the IDE: list available workflows |

## 6. Day-two operations

| Task | Command / note |
|------|----------------|
| Update workflows | `$INSTALL/update-workflows.sh` (restart HTTP server afterward) |
| Stop HTTP server | `$INSTALL/stop.sh` |
| Init / refresh a repo | `$INSTALL/init-repo.sh owner/repo` |

## More detail

| Topic | Where |
|-------|--------|
| HTTP / Docker only | [http.md](http.md) |
| stdio / local checkout only | [stdio.md](stdio.md) |
| Install script | [`scripts/install.sh`](scripts/install.sh) |
| Init repo | [`scripts/init-repo.sh`](scripts/init-repo.sh) |
| Env vars & flags (dev) | [docs/development.md](docs/development.md#environment-variables) |
| IDE rule | [docs/ide-setup.md](docs/ide-setup.md) |
| HTTP API routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
