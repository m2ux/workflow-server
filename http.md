# Setup — Docker / HTTP

Transport-specific steps for running the **GHCR image** over HTTP.  
Shared sequence: **[setup.md](setup.md)** (layout, init-repo, IDE rule, day-two).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install host layout

Fetches helper scripts, clones the `workflows` branch, creates `engineering/` + `workspace/`, writes `$INSTALL/env`:

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

> Options: `install.sh --help` (`--install-dir`, `--worktree-root`, `--engineering-root`, …).  
> Legacy URL `…/install-docker.sh` still works (forwards to `install.sh`).

## 2. Start the server

```bash
~/.local/share/workflow-server/start.sh -d
```

Defaults:

- Image: `ghcr.io/m2ux/workflow-server:main`
- Publish: `http://127.0.0.1:3000`
- Binds: host `$INSTALL/workspace` → `/var/lib/workflow-server/workspace`, host `$INSTALL/engineering` → `/var/lib/workflow-server/engineering`
- Container env: `WORKTREE_ROOT` / `WORKFLOW_WORKSPACE`, `WORKFLOW_SERVER_ENGINEERING_DIR`, `WORKFLOW_SERVER_INSTALL_DIR` (see `start.sh`)

Stop:

```bash
~/.local/share/workflow-server/stop.sh
```

Compose alternative: [`docker-compose.yml`](docker-compose.yml) (same bind names as `.env.example`).

## 3. MCP client (HTTP)

```bash
export WORKFLOW_SERVER_MCP_URL=http://127.0.0.1:3000/mcp
```

Project config (e.g. [`.cursor/mcp.json`](.cursor/mcp.json)):

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

Restart the IDE (or reload MCP servers) after setting the env var and config.

## 4. Verify

| Check | How |
|-------|-----|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `{"status":"ok"}` |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready` (workflow, schemas, workspace, and engineering dirs when split) |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |
| MCP | In the IDE: list available workflows |

Adjust host/port if you changed `--host-port`. Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

Then finish shared steps in [setup.md](setup.md) (**§2** init-repo, **§3** IDE rule, **§4** day-two).

## HTTP-only references

| Topic | Where |
|-------|--------|
| Start / stop / binds | [`scripts/start.sh`](scripts/start.sh), [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose | [`docker-compose.yml`](docker-compose.yml) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| HTTP routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Shared setup | [setup.md](setup.md) |
| stdio transport | [stdio.md](stdio.md) |
