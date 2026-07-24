# Setup — Docker / HTTP

Transport-specific steps for running the **GHCR image** over HTTP.  
Shared sequence: **[setup.md](setup.md)** (layout, init-repo, IDE rule, day-two).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install host layout

Fetches helper scripts, clones the `workflows` branch, creates `engineering/`,
`workspace/`, and `state/` (HMAC key), writes `$INSTALL/env`:

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
- Binds:
  - host `$INSTALL/workspace` → `/var/lib/workflow-server/workspace`
  - host `$INSTALL/engineering` → `/var/lib/workflow-server/engineering`
  - host `$INSTALL/state` → `/var/lib/workflow-server/state` (HMAC signing key)
- Container env: `WORKTREE_ROOT` / `WORKFLOW_WORKSPACE`, `WORKFLOW_SERVER_ENGINEERING_DIR`,
  `WORKFLOW_SERVER_INSTALL_DIR`, `WORKFLOW_SERVER_KEY_DIR` (see `start.sh`)
- Optional target repo (after `init-repo.sh owner/repo`):

  ```bash
  ~/.local/share/workflow-server/start.sh -d --repo=owner/repo
  ```

  Planning then uses `$INSTALL/engineering/owner/repo/artifacts/planning/`
  (not `$INSTALL/engineering/artifacts/planning/`).
- Runs as your host uid:gid; key path does **not** depend on `HOME` (non-root
  containers often have `HOME=/`)

Stop:

```bash
~/.local/share/workflow-server/stop.sh
```

Compose alternative: [`docker-compose.yml`](docker-compose.yml) (same bind names as `.env.example`).

## 3. MCP client (HTTP)

### Recommended for local Docker (hard-coded URL)

Cursor only expands `${env:…}` from the **IDE process** environment. If that
variable is unset, `mcp-remote` gets a broken URL. For a fixed local port, hard-code:

```json
{
  "mcpServers": {
    "workflow-server": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://127.0.0.1:3000/mcp"]
    }
  }
}
```

### Optional: env interpolation

If you launch Cursor from a shell that exports the variable:

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

### Expected log noise from `mcp-remote`

On connect, local unauthenticated HTTP may log 404s for OAuth discovery
(`.well-known/oauth-*`) and occasional `GET /mcp` → 400 during the streamable-HTTP
handshake. These are **expected** without OAuth; successful MCP init still follows.
Real failures are application errors on tools (e.g. `start_session`).

## 4. Verify

| Check | How |
|-------|-----|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `{"status":"ok"}` |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready` including **`sessionKeyWritable: true`** (plus workflow/schemas/workspace, and `engineeringDir` when split) |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |
| MCP smoke | `discover`, then `start_session` with `{ "workflow_id": "meta", "agent_id": "orchestrator" }` — listing workflows alone is not enough |

A green `/health` without `sessionKeyWritable: true` means sessions cannot start.

Adjust host/port if you changed `--host-port`. Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

Then finish shared steps in [setup.md](setup.md) (**§2** init-repo, **§3** IDE rule, **§4** day-two).

## HTTP-only references

| Topic | Where |
|-------|--------|
| Start / stop / binds | [`scripts/start.sh`](scripts/start.sh), [`scripts/stop.sh`](scripts/stop.sh) |
| Update workflows | [`scripts/update-workflows.sh`](scripts/update-workflows.sh) |
| Compose | [`docker-compose.yml`](docker-compose.yml) |
| Local `.env` helper | [`scripts/init-local-env.sh`](scripts/init-local-env.sh), [`.env.example`](.env.example) |
| HMAC key location | [docs/workflow-fidelity.md](docs/workflow-fidelity.md) (`WORKFLOW_SERVER_KEY_DIR`) |
| HTTP routes | [docs/api-reference.md](docs/api-reference.md#http-endpoints) |
| Shared setup | [setup.md](setup.md) |
| stdio transport | [stdio.md](stdio.md) |
