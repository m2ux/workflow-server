# Setup (Docker / HTTP)

Run a Dockerised workflow server and connect your IDE over HTTP.

## Layout

Host paths under the install root (defaults):

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Server data, helper scripts, `env` |
| **Workspace** | `$INSTALL/workspace` | Per-repo feature worktrees (`init-repo.sh`) |
| **Engineering** | `$INSTALL/engineering` | Per-repo engineering checkouts (`init-repo.sh`) |
| **Workflows** | `$INSTALL/workflows` | Workflow definitions (`workflows` branch) |

## 1. Install

Needs git and curl. Fetches helper scripts, clones the `workflows` branch into the install dir, creates `engineering/` and `workspace/`, and writes a persistent `env` file so `start.sh` needs no path args.

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

> Options: `…/install.sh` (`--help`, `--install-dir`, `--worktree-root`, `--engineering-root`, …)  
> Legacy URL `…/install-docker.sh` still works (forwards to `install.sh`).

## 2. Start the server

Needs [Docker](https://docs.docker.com/get-docker/).

```bash
~/.local/share/workflow-server/start.sh -d
```

Defaults:

- Image: `ghcr.io/m2ux/workflow-server:main`
- Publish: `http://127.0.0.1:3000`
- Binds: host `workspace/` → container `/var/lib/workflow-server/workspace`, host `engineering/` → `/var/lib/workflow-server/engineering`

Conversely to stop the server:

```bash
~/.local/share/workflow-server/stop.sh
```

## 3. Init a repo (optional)

Materialise per-repo engineering + workspace paths under the install root:

```bash
~/.local/share/workflow-server/init-repo.sh owner/repo
```

## 4. Check health

```bash
curl -fsS http://127.0.0.1:3000/health
```

Expect `{"status":"ok"}`.

## 5. Update workflows

Pull the latest `workflows` branch into the install dir.

```bash
~/.local/share/workflow-server/update-workflows.sh
```

> Restart the server afterward if it is already running.

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
| Install script | [`scripts/install.sh`](scripts/install.sh) |
| Init repo | [`scripts/init-repo.sh`](scripts/init-repo.sh) |
| Start | [`scripts/start.sh`](scripts/start.sh) |
| Stop | [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose / binds | [`docker-compose.yml`](docker-compose.yml) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| Stdio / local checkout | [stdio.md](stdio.md) |
| Develop from source | [docs/development.md](docs/development.md) |
| HTTP API / endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
