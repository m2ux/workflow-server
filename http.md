# Setup (Docker / HTTP)

Run a Dockerised workflow server and connect your IDE over HTTP.

For a local **stdio** checkout (IDE spawns the process), see [stdio.md](stdio.md).

## Layout

Two separate host paths:

| Path | Default | Purpose |
|------|---------|---------|
| **Install dir** | `~/.local/share/workflow-server` | Server data only: runner, updater, `workflows/` clone |
| **Worktree root** | `~/worktrees` | Shared with the agent (session checkouts / planning binds). **Not** under the install dir |

On run, the container mounts:

- `~/worktrees` → `/worktrees` (RW)
- `$INSTALL/workflows` → `/app/workflows` (RO)
- image schemas → `/app/schemas` (or `$INSTALL/schemas` if present)

Override install dir with `--install-dir` / `WORKFLOW_SERVER_INSTALL_DIR`.  
Override worktree root with `--worktree-root` / `HOST_WORKTREE_ROOT` / `WORKFLOW_WORKSPACE`.

## 1. Install

Needs git and curl. Fetches helper scripts and clones the `workflows` branch into the install dir. Does **not** start the container and does **not** create `~/worktrees` (the runner creates that on first start).

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install-docker.sh | bash
```

> Options: `bash <(curl -fsSL …/install-docker.sh) --help` (`--install-dir`, …)  
> Script: [`scripts/install-docker.sh`](scripts/install-docker.sh)

After install you have:

```text
~/.local/share/workflow-server/
  run-workflow-server.sh    # from scripts/run-docker.sh
  update-workflows.sh       # from scripts/update-workflows.sh
  workflows/                # git clone -b workflows
```

## 2. Run the server

Needs [Docker](https://docs.docker.com/get-docker/).

```bash
~/.local/share/workflow-server/run-workflow-server.sh -d
```

Defaults (no path args required after install):

- Worktree root: `~/worktrees` (created if missing)
- Workflows: `~/.local/share/workflow-server/workflows`
- Image: `ghcr.io/m2ux/workflow-server:main`
- Publish: `http://127.0.0.1:3000`

Examples:

```bash
# Custom agent worktree root
~/.local/share/workflow-server/run-workflow-server.sh --worktree-root=/path/to/worktrees -d

# Custom install dir (workflows still under that dir unless overridden)
~/.local/share/workflow-server/run-workflow-server.sh --install-dir=/opt/workflow-server -d
```

> Full options: `~/.local/share/workflow-server/run-workflow-server.sh --help`  
> Script: [`scripts/run-docker.sh`](scripts/run-docker.sh)

## 3. Check health

```bash
curl -fsS http://127.0.0.1:3000/health
```

Expect `{"status":"ok"}`.

## 4. Update workflows

Pull the latest `workflows` branch into the install dir (not the agent worktree root).

```bash
~/.local/share/workflow-server/update-workflows.sh
```

> Restart the server afterward if it is already running.  
> Script: [`scripts/update-workflows.sh`](scripts/update-workflows.sh)

## 5. Connect the MCP client

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

## 6. IDE bootstrap rule

Add the always-on rule from [docs/ide-setup.md](docs/ide-setup.md) so the agent calls `discover` on workflow requests.

---

## More detail

| Topic | Where |
|-------|--------|
| Install script | [`scripts/install-docker.sh`](scripts/install-docker.sh) |
| Run script (GHCR) | [`scripts/run-docker.sh`](scripts/run-docker.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose / binds | [`docker-compose.yml`](docker-compose.yml) (host worktree default: `~/worktrees`) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| Stdio / local checkout | [stdio.md](stdio.md) |
| Develop from source | [docs/development.md](docs/development.md) |
| HTTP API / endpoints | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Server env vars | [docs/development.md](docs/development.md) / `src/config.ts` |
| Deploy `.engineering` into a project | [`scripts/deploy.sh`](scripts/deploy.sh) |
| Architecture & fidelity | [docs/architecture.md](docs/architecture.md), [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
