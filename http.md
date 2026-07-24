# Setup — Docker / HTTP

Transport-specific steps for running the **GHCR image** over HTTP.  
Shared layout, repo init, root binding, IDE rule, and verify: **[setup.md](setup.md)** (start there, then return here for §1–3).

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

Continue with [setup.md](setup.md) **§3** (init repo) through **§8** (day-two ops). Health: `curl -fsS http://127.0.0.1:3000/health`.

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
