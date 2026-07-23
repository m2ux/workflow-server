# Setup (Docker / HTTP)

Run a Dockerised workflow server and connect your IDE over HTTP.

## Layout

Two separate host paths:

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Server data |
| **Worktree root** | `~/worktrees` | Workspace (shared with the agent) |



## 1. Install

Needs git and curl. Fetches helper scripts, clones the `workflows` branch into the install dir, creates `~/worktrees` if missing, and writes a persistent `env` file so `start.sh` needs no path args.

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
```

> Options: `…/install-docker.sh` (`--help`, `--install-dir`, `--worktree-root`, …)  


After install you have:

```text
~/.local/share/workflow-server/
  start.sh                  # scripts/start.sh
  stop.sh                   # scripts/stop.sh
  update-workflows.sh       # scripts/update-workflows.sh
  env                       # paths / port / container name for start + stop
  workflows/                # git clone -b workflows

~/worktrees/                # agent-shared worktree root (created if missing)
```

## 2. Start the server

Needs [Docker](https://docs.docker.com/get-docker/).

```bash
~/.local/share/workflow-server/start.sh -d
```

Reads `$INSTALL/env` automatically (worktree root, workflows dir, port, container name). No path flags required.

Defaults when `env` is missing:

- Image: `ghcr.io/m2ux/workflow-server:main`
- Publish: `http://127.0.0.1:3000`

> Full options: `~/.local/share/workflow-server/start.sh --help`  
> Script: [`scripts/start.sh`](scripts/start.sh)

## 3. Stop the server

```bash
~/.local/share/workflow-server/stop.sh
```

> Script: [`scripts/stop.sh`](scripts/stop.sh)

## 4. Check health

```bash
curl -fsS http://127.0.0.1:3000/health
```

Expect `{"status":"ok"}`.

## 5. Update workflows

Pull the latest `workflows` branch into the install dir (not the agent worktree root).

```bash
~/.local/share/workflow-server/update-workflows.sh
```

> Restart the server afterward if it is already running.  
> Script: [`scripts/update-workflows.sh`](scripts/update-workflows.sh)

## 6. Connect the MCP client

Export the endpoint (Cursor reads `${env:…}` from the process environment):

```bash
export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp
```

Project config ([`.cursor/mcp.json`](.cursor/mcp.json)):

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${env:WORKFLOW_SERVER_MCP_URL}"]
    }
  }
}
```

Restart the IDE, then ask it to list available workflows.

## 7. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

---

## More detail

| Topic | Where |
|-------|--------|
| Install script | [`scripts/install-docker.sh`](scripts/install-docker.sh) |
| Start | [`scripts/start.sh`](scripts/start.sh) |
| Stop | [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose / binds | [`docker-compose.yml`](docker-compose.yml) (host worktree default: `~/worktrees`) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| Stdio / local checkout | [stdio.md](stdio.md) |
| Develop from source | [docs/development.md](docs/development.md) |
| HTTP API / endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
