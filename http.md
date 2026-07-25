# Setup — Docker / HTTP

Transport-specific steps for running over HTTP.  
## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- `curl`, `git` (for `install.sh`)

## 1. Install

Fetches helper scripts, clones the `workflows` branch, ensures a projects root
and `state/` (HMAC key), writes `$INSTALL/env`.

```bash
curl -fsSL https://raw.githubusercontent.com/m2ux/workflow-server/main/scripts/install.sh | bash
```

## 2. Start

```bash
~/.local/share/workflow-server/start.sh -d
```

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

On connect, local unauthenticated HTTP may request OAuth discovery paths
(`.well-known/oauth-*`) and occasionally `GET /mcp` without a session.
Those return 404/400 and are **expected** without OAuth; successful MCP init
still follows. They appear as ordinary request logs (`type: info`), not
`type: error`. Real failures are application errors on tools (e.g. `start_session`).

## 4. Verify

| Check | How |
|-------|-----|
| Liveness | `curl -fsS http://127.0.0.1:3000/health` → `{"status":"ok"}` |
| Readiness | `curl -fsS http://127.0.0.1:3000/ready` → `status: ready` including **`sessionKeyWritable: true`** (plus workflow/schemas/workspace, and `engineeringDir` when split) |
| Container | `docker logs -f workflow-server` (default name; no crash loop) |
| MCP smoke | `discover`, then `start_session` with `{ "workflow_id": "meta", "agent_id": "orchestrator" }` — listing workflows alone is not enough |

A green `/health` without `sessionKeyWritable: true` means sessions cannot start.

Adjust host/port if you changed `--host-port`. Routes: [docs/api-reference.md](docs/api-reference.md#http-endpoints).

Then finish shared steps in [setup.md](setup.md) (**§2** prepare project, **§3** IDE rule, **§4** day-two).

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
